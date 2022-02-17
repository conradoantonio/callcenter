// Abre el modal de direcciones
$("#agregarDirecciones, #agregarDireccion").click(function() {
    $("#formDireccionesModal").modal("show");
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
        $('input#cpDireccion').val( '' );
    }
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

    $.ajax({
        url: url,
        method: 'GET',
        contentType: 'application/json',
        // data: JSON.stringify(content),
        dataType: 'json',
        success: function (data) {
            // console.log('Data: ', data);
            // swal.close();
            if ( data.length ) {
                let route = data[0];
                let splitRuta = route.nameUbicacionCil.split(" : ");

                $("input#rutaDireccion").val(splitRuta[1] ?? '');
                $("input#zonaVentaDireccion").val(route.zona_venta);
            }

        }, error: function (xhr, status, error) {
            swal.close();
            console.log('Error en la consulta', xhr, status, error);
        }
    });
}