// Abre el modal de direcciones
$("#agregarDirecciones, #agregarDireccion").click(function() {
    $("#formDireccionesModal").modal("show");
    getStates();
});

// Prellena los datos de una dirección en el modal
$("#editarDireccion").click(function() {
    let direccion = $('#direccionCliente').children(':selected').data('address');
    $("#tipoAccionDireccion").val('guardar');
    let periodo = '';
    if ( direccion ) {
        $('#internalIdDireccion').val(direccion.idAdress);
        $('#cpDireccion').val(direccion.zip);
        $('#calleDireccion').val(direccion.nameStreet);
        $('#exteriorDireccion').val(direccion.numExterno);
        $('#interiorDireccion').val(direccion.numInterno);
        $('#entre1Direccion').val(direccion.entreCalle);
        $('#entre2Direccion').val(direccion.entreYCalle);
        $('#tipoServicioFormCliente').val(direccion.typeServiceId);

        $('#entreFormCliente').val(formatTimeToPicker(direccion.ptg_entre_addr));
        $('#lasFormCliente').val(formatTimeToPicker(direccion.ptg_y_addr));
        $('#rutaDireccion').data('ruta-obj', direccion.dataZoneRoute);
        $('#indicacionesFormCliente').val(direccion.commentsAddr);

        // Valida el tipo de servicio y los datos mostrados en la ruta
        // En caso de ser ambos, el item 1 se considera como cilindro y el item 2 como estacionario
        // Sí sólo es o cilindro o estacionario, se tomará el item1 para definir sus datos
        if ( direccion.typeServiceId == "1" ) {// Cilindro
            $('.art-fre-est').addClass('d-none');
            $('.art-fre-cil').removeClass('d-none');
            $('#articuloFrecuenteCilFormCliente').val(direccion.item1Id);
            $('#inputCapacidadCilTipoServicio').val(direccion.item1Capacidad);
        } else if ( direccion.typeServiceId == "2" ) {// Estacionario
            $('.art-fre-cil').addClass('d-none');
            $('.art-fre-est').removeClass('d-none');
            $('#inputCapacidadEstTipoServicio').val(direccion.item1Capacidad);
        } else if ( direccion.typeServiceId == "4" ) {// Ambos
            $('.art-fre-est, .art-fre-cil').removeClass('d-none');
            $('#articuloFrecuenteCilFormCliente').val(direccion.item1Id);
            $('#inputCapacidadCilTipoServicio').val(direccion.item1Capacidad);
            $('#inputCapacidadEstTipoServicio').val(direccion.item2Capacidad);
        } else {
            $('.art-fre-est, .art-fre-cil').addClass('d-none');
        }

        // Campos de frecuencia
        if ( direccion.periodo == "Dia" ) {
            periodo = 1;
        } else if ( direccion.periodo == "Semanal" ) {
            periodo = 2;
        } else if ( direccion.periodo == "Mensual" ) {
            periodo = 3;
        }
        $('#cadaFormCliente').val(direccion.frecuencia)
        $('#frecuenciaFormCliente').val(periodo);

        // Días de la semana
        $('#lunesFormCliente').prop('checked', direccion.isLunes ? true : false);
        $('#martesFormCliente').prop('checked', direccion.isMartes ? true : false);
        $('#miercolesFormCliente').prop('checked', direccion.isMiercoles ? true : false);
        $('#juevesFormCliente').prop('checked', direccion.isJueves ? true : false);
        $('#viernesFormCliente').prop('checked', direccion.isViernes ? true : false);
        $('#sabadoFormCliente').prop('checked', direccion.isSabado ? true : false);
        $('#domingoFormCliente').prop('checked', direccion.isDomingo ? true : false);
        
        // Falta código para mostrar ciertos campos cuando se define el tipo de acción
        if ( direccion.dataZoneRoute ) {
            setRouteData(direccion.dataZoneRoute);
        } else {
            $("input#rutaDireccion, input#zonaVentaDireccion, input#rutaColoniaIdDireccion, input#rutaIdDireccion, input#rutaId2Direccion").val('');
        }

        // Tipo de acción
        if ( direccion.typeContact == "1" ) {// Teléfono
            $("input#tipoAccionFormClient1").prop('checked', true);
            $(".tipo-aviso-programado").addClass('d-none');
        } else if ( direccion.typeContact == "2" ) {// Aviso
            $("input#tipoAccionFormClient2").prop('checked', true);
            $(".tipo-aviso-programado").removeClass('d-none');
        } else if ( direccion.typeContact == "4" ) {// Programado
            $("input#tipoAccionFormClient3").prop('checked', true);
            $(".tipo-aviso-programado").removeClass('d-none');
        }
    } 
    $("#formDireccionesModal").modal("show");
    // Este código de obtener estados se removerá cuando esta lista se encuentre sincronizado con netsuite
    getStates();
});

// Cuando el select de estados cambie, manda a llamar la petición de obtener ciudades
$('select#estadoDireccion').on('change', function(e) {
    // let val = $( "select#estadoDireccion option:selected" ).text();
    let val = $( this ).val();
    if ( val ) {
        getCities( val );
    }
});

$('select#municipioDireccion').on('change', function(e) {
    // let val = $( "select#municipioDireccion option:selected" ).text();
    let val = $( this ).val();
    if ( val ) {
        getColonies( val );
    }
});

// Se busca la zona de venta/ruta
$('select#coloniaDireccion').on('change', function(e) {
    // let val = $( "select#coloniaDireccion option:selected" ).val();
    let val = $( this ).val();
    let cp  = $( this ).children('option:selected').data('cp');

    console.log('val y cp: ', val, cp);
    
    if ( val ) {
        $('input#cpDireccion').val( cp );
        getRoute( val );
    } else {
        console.log('Falta código para resetear las rutas');
        $('input#cpDireccion').val( '' );
    }
});

// Se debe modificar la ruta dependiendo del tipo de servicio
$('select#tipoServicioFormCliente').on('change', function(e) {
    let val = $(this).val();
    let route = $('#rutaDireccion').data('ruta-obj');

    if ( val == 1 ) {// Cilindros
        $('.art-fre-est').addClass('d-none');
        $('.art-fre-cil').removeClass('d-none');
    } else if ( val == 2 ) {// Estacionarios
        $('.art-fre-cil').addClass('d-none');
        $('.art-fre-est').removeClass('d-none');
    } else if ( val == 4 ) {// Ambas
        $('.art-fre-est, .art-fre-cil').removeClass('d-none');
    } else {// Se seleccionó la primera opción
        $('.art-fre-est, .art-fre-cil').addClass('d-none');
    }

    // Setea o resetea los campos de ruta
    if ( route  ) {
        setRouteData(route);
    } else {
        $("input#rutaDireccion, input#zonaVentaDireccion, input#rutaColoniaIdDireccion, input#rutaIdDireccion, input#rutaId2Direccion").val('');
    }

    // Nota: Preferible agregar una función que haga esto.
    console.log('Falta código para validar los inputs relacionados a las rutas');
});

// Obtiene los estados disponibles
function getStates(country = 'México') {
    let content = {
        "type" : 'estado',
        "data" : '',
    };

    // $.ajax({
    //     url: urlGetPlaces,
    //     method: 'POST',
    //     contentType: 'application/json',
    //     data: JSON.stringify(content),
    //     dataType: 'json',
    //     success: function (data) {
    //         console.log('Data: ', data);
    //         // swal.close();
    //         let estados = JSON.parse(data.data);
    //         console.log('estados:', estados);
            let estados = [
                {"0":"01","IdEnt":"01","1":"AGUASCALIENTES","Entidad":"AGUASCALIENTES"},
                {"0":"02","IdEnt":"02","1":"BAJA CALIFORNIA","Entidad":"BAJA CALIFORNIA"},
                {"0":"24","IdEnt":"24","1":"SAN LUIS POTOSI","Entidad":"SAN LUIS POTOSI"}
            ];
            $('select#estadoDireccion').children('option').remove();

            if ( estados.length ) {
                $('#estadoDireccion').append('<option value="">Seleccione una opción</option>');
                for ( var key in estados ) {
                    if ( estados.hasOwnProperty( key ) ) {
                        // Se obtiene la dirección por default
                        $('#estadoDireccion').append(
                            '<option value="'+estados[key].Entidad+'">'+estados[key].Entidad+'</option>'
                        );
                    }
                }
            } else{
                $('#estadoDireccion').append('<option value="">No hay opciones disponibles</option>');
            }

    //     }, error: function (xhr, status, error) {
    //         swal.close();
    //         console.log('Error en la consulta', xhr, status, error);
    //     }
    // });
}

// Método para obtener las ciudades/municipios de un estado
function getCities(state) {
    let content = {
        "type" : 'entidades',
        "data" : state,
    };

    // $.ajax({
    //     url: urlGetPlaces,
    //     method: 'POST',
    //     contentType: 'application/json',
    //     data: JSON.stringify(content),
    //     dataType: 'json',
    //     success: function (data) {
    //         console.log('Data: ', data);
    //         // swal.close();
    //         let ciudades = JSON.parse(data.data);
    //         console.log('ciudades:', ciudades);
            let ciudades = [
                {"0": "24", "IdEnt": "24", "1": "SAN LUIS POTOSI", "Entidad": "SAN LUIS POTOSI", "2": "SAN LUIS POTOSI", "Municipio": "SAN LUIS POTOSI"},
                {"0": "24", "IdEnt": "24", "1": "SAN LUIS POTOSI", "Entidad": "SAN LUIS POTOSI", "2": "SAN MARTIN CHALCHICUAUTLA", "Municipio": "SAN MARTIN CHALCHICUAUTLA"},
                {"0": "24", "IdEnt": "24", "1": "SAN LUIS POTOSI", "Entidad": "SAN LUIS POTOSI", "2": "SAN NICOLAS TOLENTINO", "Municipio": "SAN NICOLAS TOLENTINO"},
            ];
            $('select#municipioDireccion').children('option').remove();

            if ( ciudades.length ) {
                $('#municipioDireccion').append('<option value="">Seleccione una opción</option>');
                for ( var key in ciudades ) {
                    if ( ciudades.hasOwnProperty( key ) ) {
                        // Se obtiene la dirección por default
                        $('#municipioDireccion').append(
                            '<option value="'+ciudades[key].Municipio+'">'+ciudades[key].Municipio+'</option>'
                        );
                    }
                }
            } else{
                $('#municipioDireccion').append('<option value="">No hay opciones disponibles</option>');
            }

    //     }, error: function (xhr, status, error) {
    //         swal.close();
    //         console.log('Error en la consulta', xhr, status, error);
    //     }
    // });
}

// Método para obtener las ciudades/municipios de un estado
function getColonies(city) {
    let content = {
        "type" : 'colonia',
        "data" : city,
    };

    // $.ajax({
    //     url: urlGetPlaces,
    //     method: 'POST',
    //     contentType: 'application/json',
    //     data: JSON.stringify(content),
    //     dataType: 'json',
    //     success: function (data) {
    //         console.log('Data: ', data);
    //         // swal.close();
    //         let colonias = JSON.parse(data.data);
    //         console.log('colonias:', colonias);
            let colonias = [
                {"0": "24", "IdEnt": "24", "1": "SAN LUIS POTOSI", "Entidad": "SAN LUIS POTOSI", "2": "SAN LUIS POTOSI", "Municipio": "SAN LUIS POTOSI", "3": "AGUA SAL", "Colonia": "AGUA SAL", "4": "78385", "CP": "78385"},
                {"0": "24", "IdEnt": "24", "1": "SAN LUIS POTOSI", "Entidad": "SAN LUIS POTOSI", "2": "SAN LUIS POTOSI", "Municipio": "SAN LUIS POTOSI", "3": "ANTORCHA POPULAR", "Colonia": "ANTORCHA POPULAR", "4": "78385", "CP": "78385"},
                {"0": "24", "IdEnt": "24", "1": "SAN LUIS POTOSI", "Entidad": "SAN LUIS POTOSI", "2": "SAN LUIS POTOSI", "Municipio": "SAN LUIS POTOSI", "3": "CIRCUITO SANTA CLARA", "Colonia": "CIRCUITO SANTA CLARA", "4": "78385", "CP": "78385"},
            ];
            $('select#coloniaDireccion').children('option').remove();

            if ( colonias.length ) {
                $('#coloniaDireccion').append('<option value="">Seleccione una opción</option>');
                for ( var key in colonias ) {
                    if ( colonias.hasOwnProperty( key ) ) {
                        // Se obtiene la dirección por default
                        $('#coloniaDireccion').append(
                            '<option value="'+colonias[key].Colonia+'" data-cp="'+colonias[key].CP+'">'+colonias[key].Colonia+'</option>'
                        );
                    }
                }
            } else{
                $('#coloniaDireccion').append('<option value="">No hay opciones disponibles</option>');
            }

    //     }, error: function (xhr, status, error) {
    //         swal.close();
    //         console.log('Error en la consulta', xhr, status, error);
    //     }
    // });
}

// Método para obtener las zonas de venta y ruta de una colonia seleccionada
function getRoute(val) {
    let colonia = $( "select#coloniaDireccion option:selected").text();
    let zip     = $( "select#coloniaDireccion option:selected").data('cp');
    let url     = urlObtenerZonas.concat('&zip='+zip+'&colonia='+colonia);

    let settings = {
        url    : url,
        method : 'GET',
    }

    setAjax(settings).then((response) => {
        let data = response.data;
        // let tipoServicioId = $('#tipoServicioFormCliente').val();
        if ( data.length ) {
            $('#rutaDireccion').data('ruta-obj', data[0]);
            setRouteData(data[0]);
        } else {
            $('#rutaDireccion').data('ruta-obj', null);
            $("input#rutaDireccion, input#zonaVentaDireccion, input#rutaColoniaIdDireccion, input#rutaIdDireccion, input#rutaId2Direccion").val('');
        }
    }).catch((error) => {
        console.log('La consulta no obtuvo información', error);
    });
}

// Cambia la información de los campos relacionados a la ruta de envío
function setRouteData(route) {
    let tipoServicioId = $('#tipoServicioFormCliente').val();
    // console.log('Data: ', data);
    let nombreRuta = ubicacionId = '';
    let zonaVenta = route.zona_venta;
    let routeId = route.id;
    let ubicacionId2 = null;
    let splitRutaCil = route.nameUbicacionCil.split(" : ");
    let splitRutaEst = route.nameUbicacionEst.split(" : ");
    if ( tipoServicioId == 1 ) {//Cilindro
        console.log('cilindro');
        splitRutaCil[1] ? ( nombreRuta+=splitRutaCil[1] ) : '';
        ubicacionId = route.ubicacionCil;
    } else if( tipoServicioId == 2 ) {// Estacionario
        console.log('estacionario');
        splitRutaEst[1] ? ( nombreRuta+=splitRutaEst[1] ) : '';
        ubicacionId = route.ubicacionEst;
    } else if( tipoServicioId == 4 ) {// Ambas
        console.log('ambas');
        splitRutaCil[1] ? ( nombreRuta+=splitRutaCil[1] ) : '';
        splitRutaEst[1] ? ( nombreRuta+=', '+splitRutaEst[1] ) : '';
        ubicacionId  = route.ubicacionCil;
        ubicacionId2 = route.ubicacionEst;
    } else {// No se ha seleccionado nada
        console.log('ninguna seleccionada');
        nombreRuta = zonaVenta = '';
        ubicacionId = ubicacionId2 = routeId = null;
    }

    $("input#rutaDireccion").val(nombreRuta);
    $("input#zonaVentaDireccion").val(zonaVenta);
    $("input#rutaColoniaIdDireccion").val(routeId);
    $("input#rutaIdDireccion").val(ubicacionId);
    $("input#rutaId2Direccion").val(ubicacionId2);
}