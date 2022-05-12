// Abre el modal de direcciones
$("#agregarDirecciones, #agregarDireccion").click(function() {
    loadMsg();
    getEstados(false, function() {
        if($("#estadoDireccion").children('option').length == 2) {
            getMunicipios(false, function() {
                if($("#municipioDireccion").children('option').length == 2) {
                    getColonias(false, function() {
                        if($("#coloniaDireccion").children('option').length == 2) {
                            $("#coloniaDireccion").val(direccion.colonia).trigger("change");
                        }
                        $("#formDireccionesModal").modal("show");
                        swal.close();                        
                    })
                } else {
                    $("#formDireccionesModal").modal("show");
                    swal.close();
                }
            });
        } else {
            $("#formDireccionesModal").modal("show");
            swal.close();
        }        
    });
    
    //getStates();
});

// Prellena los datos de una dirección en el modal
$("#editarDireccion").click(function() {
    let direccion = $('#direccionCliente').children(':selected').data('address');
    $("#tipoAccionDireccion").val('guardar');
    let periodo = '';
    loadMsg();
    if ( direccion ) {
        if(customerGlobal.rfc) {
            $($(".dato-facturacion").removeClass("d-none"));
        } else {
            $($(".dato-facturacion").addClass("d-none"));
        }
        // Se ocultan los campos de frecuencia y posteriormente se decide si se muestran o no
        $('.frecuencia-cada, .frecuencia-semana').addClass('d-none');
        if ( direccion.defaultBilling ) {// Dirección de facturación
            // $('#domFacturacionDireccion').parent().parent().removeClass('d-none');
            $('#domFacturacionDireccion').prop('checked', true);
        }
        
        $('#internalIdDireccion').val(direccion.idAdress);
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
        if ( direccion.periodo == "Día" ) {
            periodo = 1;
            $('.dias-semana').prop('disabled', true);
            $('.dias-semana').prop('checked', true);
        } else if ( direccion.periodo == "Semana" ) {
            periodo = 2;
            $('.dias-semana').prop('disabled', false);
            $('.frecuencia-cada').removeClass('d-none');
        } else if ( direccion.periodo == "Mes" ) {
            periodo = 3;
            $('.dias-semana').prop('disabled', false);
            $('.frecuencia-cada, .frecuencia-semana').removeClass('d-none');
            $('#numeroSemana').val(parseInt(direccion.inThatWeek));
        }

        $('#fechaInicioServicio').val(getMomentDateFormat(direccion.startDayService));
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

    getEstados(false, function() {
        if($("#estadoDireccion option[value='"+direccion.stateName+"']").length > 0) {
            $("#estadoDireccion").val(direccion.stateName);
            getMunicipios(false, function() {
                if($("#municipioDireccion option[value='"+direccion.city+"']").length > 0) {
                    $("#municipioDireccion").val(direccion.city);
                    getColonias(false, function() {
                        if($("#coloniaDireccion option[value='"+direccion.colonia+"']").length > 0) {
                            $("#coloniaDireccion").val(direccion.colonia).trigger("change");
                        }
                        $("#formDireccionesModal").modal("show");
                        swal.close();                        
                    })
                } else {
                    $("#formDireccionesModal").modal("show");
                    swal.close();
                }
            });
        } else {
            $("#formDireccionesModal").modal("show");
            swal.close();
        }
    });
    // Este código de obtener estados se removerá cuando esta lista se encuentre sincronizado con netsuite
    //getStates();
});

// Cuando el select de estados cambie, manda a llamar la petición de obtener ciudades
$('select#estadoDireccion').on('change', function(e) {
    getMunicipios(true);
});

$('select#municipioDireccion').on('change', function(e) {
    getColonias(true);
});

// Se busca la zona de venta/ruta
$('select#coloniaDireccion').on('change', function(e) {
    setDataAuxDireccion();
});

function setDataAuxDireccion() {
    let tipoServicioId = $("#tipoServicioFormCliente").val();
    let plantaActual   = $("#plantas option:selected").text().trim();

    if( $("#coloniaDireccion").val() ) {
        let auxItem = $("#coloniaDireccion option:selected").data("item");
        if( ( auxItem.rutaCil && auxItem.rutaCil.split(":")[0].trim() == plantaActual ) || ( auxItem.rutaEsta && auxItem.rutaEsta.split(":")[0].trim() == plantaActual ) ) {
            $("#zonaVentaDireccion").val(auxItem.zonePrice);
            $("#cpDireccion").val(auxItem.zip);
            if( tipoServicioId ) {
                if ( tipoServicioId == 1 ) {//Cilindro
                    console.log('cilindro');
                    $("#rutaDireccion").val(auxItem.rutaCil && auxItem.rutaCil.split(":").length > 1 ? auxItem.rutaCil.split(":")[1].trim() : ( auxItem.rutaCil ?? '' ) );
                    $("#rutaDireccionVesp").val(auxItem.rutaCilVesp && auxItem.rutaCilVesp.split(":").length > 1 ? auxItem.rutaCilVesp.split(":")[1].trim() : ( auxItem.rutaCilVesp ?? '' ) );
                } else if( tipoServicioId == 2 ) {// Estacionario
                    console.log('estacionario');
                    $("#rutaDireccion").val(auxItem.rutaEsta && auxItem.rutaEsta.split(":").length > 1 ? auxItem.rutaEsta.split(":")[1].trim() : ( auxItem.rutaEsta ?? '' ) );
                    $("#rutaDireccionVesp").val(auxItem.rutaEstVesp && auxItem.rutaEstVesp.split(":").length > 1 ? auxItem.rutaEstVesp.split(":")[1].trim() : ( auxItem.rutaEstVesp ?? '' ) );
                } else if( tipoServicioId == 4 ) {// Ambas
                    console.log('ambas');
                    // Se asignan primero las rutas matutinas
                    let auxMat = "";
                    if( auxItem.rutaCil ) {
                        auxMat += auxItem.rutaCil.split(":").length > 1 ? auxItem.rutaCil.split(":")[1].trim() : auxItem.rutaCil.trim();
                    }
                    if( auxMat != "" ) {
                        auxMat += ", ";
                    }
                    if( auxItem.rutaEsta ) {
                        auxMat += auxItem.rutaEsta.split(":").length > 1 ? auxItem.rutaEsta.split(":")[1].trim() : auxItem.rutaEsta.trim();
                    }
                    $("#rutaDireccion").val(auxMat);

                    // Se asignan después las rutas vespertinas
                    let auxVesp = "";
                    if( auxItem.rutaCilVesp ) {
                        auxVesp += auxItem.rutaCilVesp.split(":").length > 1 ? auxItem.rutaCilVesp.split(":")[1].trim() : auxItem.rutaCilVesp.trim();
                    }
                    if( auxVesp != "" ) {
                        auxVesp += ", ";
                    }
                    if( auxItem.rutaEstVesp ) {
                        auxVesp += auxItem.rutaEstVesp.split(":").length > 1 ? auxItem.rutaEstVesp.split(":")[1].trim() : auxItem.rutaEstVesp.trim();
                    }
                    $("#rutaDireccionVesp").val(auxVesp);
                }
            } else {
                $("#rutaDireccion, #rutaDireccionVesp").val("");
            }
        } else {
            infoMsg("error", "Error:", "La colonia seleccionada no pertenece a la planta actual");
            $("#coloniaDireccion").val(null);
            $("#zonaVentaDireccion").val("");
            $("#rutaDireccion, #rutaDireccionVesp").val("");
        }        
    } else {
        $("#coloniaDireccion").val(null);
        $("#zonaVentaDireccion").val("");
        $("#rutaDireccion, #rutaDireccionVesp").val("");
    }
}

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
    setDataAuxDireccion();

    // Nota: Preferible agregar una función que haga esto.
    //console.log('Falta código para validar los inputs relacionados a las rutas');
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
function getRoute() {
    let colonia = $( "select#coloniaDireccion option:selected").text();
    let zip     = $( "#cpDireccion").val();
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