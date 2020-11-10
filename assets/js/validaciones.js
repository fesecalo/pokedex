$(document).ready(function(){

	//para que no muestre el mensaje al hacer click en el text box
	$('[data-toggle="popover"]').popover({trigger:'manual'});

	//oculto el div de resultado y sus contenidos
	$('#resultado').hide();

	//buscar poke
	$('#formulario').submit(function(){		
		//para que no se recargue la página
		event.preventDefault();

		//se ocultan los elementos del div resultados
		hideDiv();

		//se almacena el pokemon escrito por el usuario.
		//api pide los nombres en minusculas.
		var txtPoke = $("#txt-poke").val().toLowerCase();

		//se valida que sólo tenga letras y números
		if(!txtPoke.match(/^[a-zA-Z0-9]+$/igm))
		{
			$("#txt-poke").val('');
			$('#txt-poke').popover("show");
			setTimeout(function (){
        		$('#txt-poke').popover('hide');
    		}, 5000);
		}
		else
		{
			//muestro la barra de progresión hasta que tenga resultdos.
			$('#resultado').show();
			$('.progress').show();

			$.ajax({
				type:"GET",
				url:"https://pokeapi.co/api/v2/pokemon/"+txtPoke,
				dataType:"json",
					success: function(data) {
						muestraDetalle(data);
						cargaGrafico(data);
					},
					error: function(err){
						muestraError();
					}
			});
		}
	});

	//función para mostrar el mensaje de error
	function muestraError()
	{
		if($('#mensajeError').length==0)
		{
			//no existe, se debe crear
			var divError=document.createElement("DIV");
			divError.setAttribute("class", "row text-center");
			divError.setAttribute("id", "mensajeError");

			var divPikachu=document.createElement("DIV");
			divPikachu.setAttribute("class", "col-md-12");

			var imgPikachu=document.createElement("img");
			imgPikachu.setAttribute("class", "w-25 rounded-circle");
			imgPikachu.setAttribute("src", "assets/img/cry.jpg");
			divPikachu.appendChild(imgPikachu);	

			var divMsg=document.createElement("DIV");
			divMsg.setAttribute("class", "col-md-12");
			divMsg.innerHTML="Lo sentimos. Ocurrió un problema. Inténtalo nuevamente"

			divError.appendChild(divPikachu);
			divError.appendChild(divMsg);

			$('#resultado').append(divError);
		}

		$('.progress').hide();
		$('#mensajeError').show();
	}

	//función para mostrar detalle del poke en caso que encontrarse en la api
	function muestraDetalle(data)
	{
		//'limpiar' los div de los tipos.
		$('#detalles').html('');
		$('#pokeNombre').html(data.name);
		$('#pokeImage').attr('src', data.sprites.front_default);

		//titulo tipos
		$('#detalles').append('<div class="mb-2"><u>Tipos:</u></div>');
		//por cada tipo crea un div
		for (var i=0; i <data.types.length; i++)
		{
			var divTipo=document.createElement("DIV");
			divTipo.setAttribute("class", "rounded mb-2 text-center");
			divTipo.setAttribute("id", "tipo"+i);
			$('#detalles').append(divTipo);
			divTipo.innerHTML=data.types[i].type.name;
			cambiaFondo($('#tipo'+i), data.types[i].type.name);
		}

		//titulo habilidades
		$('#detalles').append('<div class="mb-2"><u>Habilidades:</u></div>');
		//por cada habilidad crea un div
		//por cada habilidad del poke, consulto su descripción con el ajax
		//almaceno las respuestas en un array
		var promises = [];
		for (var i=0;i<data.abilities.length; i++)
		{
			let url = data.abilities[i].ability.url;
			promises.push($.ajax({ type:"GET", url:url,dataType:"json" }));
		}

		//cuando estén resueltas todas las llamadas al ajax. 
		Promise.all(promises).then(function(resueltas){
			//las consultas resueltas se alamcenan en un array
			for(key in resueltas)
			{
				for (var x=0; x<resueltas[key].effect_entries.length; x++)
				{
					if(resueltas[key].effect_entries[x].language.name=="en")
					{
						var divTipo=document.createElement("DIV");
						divTipo.setAttribute("class", "rounded mb-4 text-center");

						divTipo.setAttribute("data-toggle", "tooltip");
						divTipo.setAttribute("data-placement", "top");
						divTipo.setAttribute("title", resueltas[key].effect_entries[x].effect);

						divTipo.setAttribute("id", "habilidad"+key);
						$('#detalles').append(divTipo);
						divTipo.innerHTML=data.abilities[key].ability.name;
					}
				}
			}
			$('#detallePoke').show();
        	$('.progress').hide();
        	//activa la descripción de las habilidades
			$('[data-toggle="tooltip"]').tooltip();
		});


		//FORMA RECURSIVA PARA HACERLO SINCRONICO
/*		//titulo habilidades
		$('#detalles').append('<div class="mb-2"><u>habilidades:</u></div>');
		//por cada habilidad crea un div
		//https://unipython.com/ajax-dentro-del-ciclo-for-en-java-script/
		function enviar(data, i)
		{
			if(i<data.abilities.length)
			{
				let url = data.abilities[i].ability.url;
				$.ajax({
					type:"GET",
					url:url,
					dataType:"json",
					success: function(descH) {
						for (var x=0; x<descH.effect_entries.length; x++)
						{
							if(descH.effect_entries[x].language.name=="en")
							{
								var divTipo=document.createElement("DIV");
								divTipo.setAttribute("class", "rounded mb-2");
								divTipo.setAttribute("data-toggle", "tooltip");
								divTipo.setAttribute("data-placement", "top");
								divTipo.setAttribute("title", descH.effect_entries[x].effect);
								divTipo.setAttribute("id", "habilidad"+i);
								$('#detalles').append(divTipo);
								divTipo.innerHTML=data.abilities[i].ability.name;
							}
						}
						enviar(data, i+1);
					}
				});
			}
			else
			{
				$('#detallePoke').show();
        		$('.progress').hide();
			}

		}
		//parte en el indice 0, cuando la consulta dentro de la función se realiza ok, se realiza recursividad con el indice +1
		enviar(data, 0);*/
	}

	//carga el gráfico en el modal
	function cargaGrafico(data)
	{
		//https://jsfiddle.net/canvasjs/u4LL861j/
		var chart = new CanvasJS.Chart("chartContainer", {        
		  data: [
		    {
		      type: "pie",
		      dataPoints: [
		        { label: data.stats[0].stat.name.toUpperCase(), y: data.stats[0].base_stat },
		        { label: data.stats[1].stat.name.toUpperCase(), y: data.stats[1].base_stat },
		        { label: data.stats[2].stat.name.toUpperCase(), y: data.stats[2].base_stat },
		        { label: data.stats[3].stat.name.toUpperCase(), y: data.stats[3].base_stat },
		        { label: data.stats[4].stat.name.toUpperCase(), y: data.stats[4].base_stat },
		        { label: data.stats[5].stat.name.toUpperCase(), y: data.stats[5].base_stat }
		      ]
		    }         
		  ],
		  backgroundColor: "transparent",
		  theme: "light2"
		});

		$('#pokeStats').on('shown.bs.modal', function () {
		  chart.render();
		});
	}

	//función para ocultar los elementos dentro del div resultados
	function hideDiv()
	{
		$('#mensajeError').hide();
		$('#detallePoke').hide();
		$('.progress').hide();
	}

	//cambia el color del fondo del elemento según el tipo entregado
	function cambiaFondo(elemento, tipo)
	{
		switch (tipo)
		{
			case 'normal':
				elemento.css('background', '#A9A878');
			break;
			case 'bug':
				elemento.css('background', '#A8B820');
			break;
			case 'fighting':
				elemento.css('background', '#C02F27');
			break;
			case 'ghost':
				elemento.css('background', '#715799');
			break;
			case 'electric':
				elemento.css('background', '#F9D130');
			break;
			case 'flying':
				elemento.css('background', '#A68DF0');
			break;
			case 'steel':
				elemento.css('background', '#B8B8D0');
			break;
			case 'psychic':
				elemento.css('background', '#F95788');
			break;
			case 'poison':
				elemento.css('background', '#A03FA1');
			break;
			case 'fire':
				elemento.css('background', '#F17F2E');
			break;
			case 'ice':
				elemento.css('background', '#98D9D9');
			break;
			case 'ground':
				elemento.css('background', '#E0BD5D');
			break;
			case 'water':
				elemento.css('background', '#6890F0');
			break;
			case 'dragon':
				elemento.css('background', '#6F37F9');
			break;
			case 'rock':
				elemento.css('background', '#B89F38');
			break;
			case 'grass':
				elemento.css('background', '#A9A878');
			break;
			case 'dark':
				elemento.css('background', '#78C850');
			break;
			case 'fairy':
				elemento.css('background', '#EE99AC');
			break;
		}
	}
});//final del ready