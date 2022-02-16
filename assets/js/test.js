// Código de Conrado y Christian

// Se inyecta la información del usuario logueado
$('span.user-name').text(userName);
$('span#role').text(userRole);

// Evento que dispara la búsqueda de un cliente
$('input#buscarCliente').on('keypress',function(e) {
    if( e.which == 13 ) {
        loadMsg('success', false, 'Espere un momento...');
        searchCustomer( $(this).val() );
    }
});

function searchCustomer(search) {
    let dataSearchCustomer = {
        "phone"  : search,
        "planta" : $("select#plantas").val(),
    };

    $.ajax({
        url: urlObtenerCliente,
        method: 'POST',
        data: JSON.stringify(dataSearchCustomer),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            // Encontró un cliente
            swal.close();
            if ( data.isSuccessful ) {
                customerGlobal = data.data[0];
                setCustomerInfo(data.data[0]);
            }
            console.log('Data: ', data);

        }, error: function (xhr, status, error) {
            swal.close();
            console.log('Error en la consulta', xhr, status, error);
        }
    });
}

// Función para enviar la información del cliente al frontend
function setCustomerInfo(customer) {
    let direcciones = customer.addr;
    let zonaVenta = direccionDefault = null;

    $('#idCliente').text(customer.id);
    $('#nombreCliente').text(customer.nombreCompleto);
    $('#telefonoCliente').text(customer.telefono);
    $('#giroCliente').text(customer.giroCliente);
    $('#contratoCliente').text(customer.contrato ? customer.contrato : 'Pendiente de validar');
    $('#notasCliente').text(customer.notasCustomer ? customer.notasCustomer : 'Sin notas');
    $('#tipoCliente').text(customer.typeCustomer);
    $('#tipoServicioCliente').text(customer.tipoServicio);

    // Agrega las direcciones del cliente al select
    $('#direccionCliente').children('option').remove();

    if ( direcciones.length ) {
        for ( var key in direcciones ) {
            if ( direcciones.hasOwnProperty( key ) ) {
                // Se obtiene la dirección por default
                if ( direcciones[key].defaultShipping ) {
                    direccionDefault = direcciones[key];
                }
                let textoDireccion = setDir(direcciones[key]);

                $('#direccionCliente').append(
                    '<option '+(direcciones[key].defaultShipping ? 'selected' : '')+' value="'+direcciones[key].idAdress+'">'+textoDireccion+'</option>'
                );
            }
        }
    }

    // Obtiene los casos y oportunidades del cliente
    getCasosOportunidades();

    // Se obtienen los datos de la colonia
    getColoniaZona(direccionDefault?.colonia);
}

// Obtiene la información de la zona acorde a la colonia por default del cliente
function getColoniaZona(colonia) {
    let zona = null;
    let dataGetZona = {
        "colonia" : colonia,
    };

    $.ajax({
        url: urlObtenerZona,
        method: 'POST',
        data: JSON.stringify(dataGetZona),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            // console.log('Esta es la data de la zona:', data);
            let ruta = data[0].nameUbicacionCil;
            let splitRuta = ruta.split(" : ");
            let desde = customerGlobal.desde;
            let hasta = customerGlobal.hasta;
            let horaInicioFormateada = horaFinFormateada = horas = null;

            $('#zonaVentaCliente').text(data[0].idInterno);
            $('#zonaPrecioCliente').text('$'+data[0].precio);
            $('#rutaCliente').text(splitRuta[1] ?? "Sin ruta");
            $('#zonaVentaPedido').val(data[0]?.idInterno);

            if ( desde ) {
                let medioDia = desde.split(" ");
                let horaInicio = desde.split(":");

                // Se le suma 12 horas por el formato de 24 hrs
                if ( medioDia[1].toUpperCase() == 'PM' ) {
                    horas = new Number(horaInicio[0]) + 12;
                } else {
                    horas = horaInicio[0];
                }

                let customDate = new Date();
                customDate.setHours(horas);
                customDate.setMinutes(horaInicio[1].split(" ")[0]);

                let horaInicioStr = moment(customDate).format('HH:mm');
                $('#desdePedido').val(horaInicioStr);
            } 

            if ( hasta ) {
                let medioDia = hasta.split(" ");
                let horaInicio = hasta.split(":");
                console.log('medioDia:', medioDia);

                // Se le suma 12 horas por el formato de 24 hrs
                if ( medioDia[1].toUpperCase() == 'PM' ) {
                    horas = new Number(horaInicio[0]) + 12;
                } else {
                    horas = horaInicio[0];
                }

                let customDate = new Date();
                customDate.setHours(horas);
                customDate.setMinutes(horaInicio[1].split(" ")[0]);

                let horaFinStr = moment(customDate).format('HH:mm');
                $('#hastaPedido').val(horaFinStr);

            }
        }, error: function (xhr, status, error) {
            swal.close();
            console.log('Error en la consulta', xhr, status, error);
        }
    });
}

// Función para configurar el formato / texto de la dirección de un cliente
function setDir(direccion) {
    let str = '';

    str += direccion.nameStreet;
    direccion.numExterno ? str+= direccion.numExterno : '';
    direccion.colonia    ? str+= ', Col. '+direccion.colonia : '';
    direccion.stateName  ? str+= ', '+direccion.stateName : '';
    direccion.city       ? str+= ', '+direccion.city : '';
    direccion.zip        ? str+= ', C.P. '+direccion.zip : '';

    return str;
}

// Ajax para obtener las plantas
let dataPlantas = {
    "requestType" : 'getPlantas'
};

$.ajax({
    url: urlPlantas,
    method: 'GET',
    data: JSON.stringify(dataPlantas),
    contentType: 'application/json',
    dataType: 'json',
    success: function (data) {
        // console.log('Data: ', data);
        setSelectPlants(JSON.parse(data));

    }, error: function (xhr, status, error) {
        console.log('Error en la consulta');
    }
});

// Método para llenar el select de plantas
function setSelectPlants(items) {
    if ( items.length ) {
        $('select#plantas').children('option').remove();
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#plantas").append(
                    '<option value='+items[key].id+'>'+items[key].nombre+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay plantas por cargar');
    }
}

// Ajax para crear un pedido
let pedidoData = {
    "opportunities": [
        {
            "status": "10",
            "dateCreate": "10/01/2022",
            "closeDate": "11/01/2022",
            "customer": "26163",
            "operario": "1178",
            "route": "1",
            "turn": "1",
            "paymentMethod": "1",
            "origen": "1",
            "typeservice": "1",
            "comentary": "esto es un comentario",
            "rangeH1": "12:33",
            "rangeH2": "13:33",
            "numero_viaje": "60",
            "zona_precio": "1",
            "tipo": "4",
            "weekDay": [
                1,
                3,
                5
            ],
            "items": [
                {
                    "article": 1754,
                    "quantity": 1,
                    "units": "1",
                    "eliminar": true,
                    "zoneprice": "225",
                    "capacity": "10"
                }
            ]
        }
    ]
}

// $.ajax({
//     url: urlCrearOp,
//     method: 'POST',
//     data: JSON.stringify(pedidoData),
//     contentType: 'application/json',
//     dataType: 'json',
//     success: function (data) {
//         console.log('pedido creado exitósamente', data);
//         // setSelectPlants(JSON.parse(data));

//     }, error: function (xhr, status, error) {
//         console.log('Error en la consulta');
//     }
// });


// Función y ajax para obtener los pedidos
function getCasosOportunidades() {
    let dataObtenerPedido = {
        "id" : $("#idCliente").text()
    };

    $.ajax({
        url: urlObtenerPedidos,
        method: 'POST',
        data: JSON.stringify(dataObtenerPedido),
        contentType: 'application/json',
        dataType: 'json',
        success: function (data) {
            console.log('pedidos obtenidos exitósamente', data);
            setHistoricTable(data);

        }, error: function (xhr, status, error) {
            console.log('Error en la consulta', error);
        }
    });
}

// Valida el contenido de casos y oportunidades y llama la función setTrOppCases
function setHistoricTable( data ) {
    $('div#historic-data').fadeOut();
    let casos         = data.casos;
    let oportunidades = data.oportunidades;
    console.warn(casos, oportunidades);

    // Se remueven registros previos
    $('div#historic-data table.table-gen tbody').children('tr').remove();

    // Checa casos
    if ( casos.length ) {
        // console.log('Tiene varios registros');
        for ( var key in casos ) {
            if ( casos.hasOwnProperty( key ) ) {
                $('div#historic-data table.table-gen tbody').append(
                    setTrOppCases( casos[key] )
                );
            }
        }
    } else {
        console.warn('No hay oportunidades por cargar');
    }

    // Checa oportunidades
    if ( oportunidades.length ) {
        // console.log('Tiene varios registros');
        for ( var key in oportunidades ) {
            if ( oportunidades.hasOwnProperty( key ) ) {
                $('div#historic-data table.table-gen tbody').append(
                    setTrOppCases( oportunidades[key] )
                );
            }
        }
    } else {
        console.warn('No hay oportunidades por cargar');
    }

    // Vuelve a mostrar la tabla
    $('div#historic-data').fadeIn('slow');
}

// Método para llenar la tabla de casos y oportunidades
function setTrOppCases(item, type = 'casos') {
     
    let tr = '<tr>'+
        '<td>Popover</td>'+
        '<td>Checkbox</td>'+
        '<td>Red b</td>'+
        '<td>'+( item.fecha ?? 'Sin fecha')+'</td>'+
        '<td>'+( item.fechaNotificacion ?? 'Sin fecha visita' )+'</td>'+
        '<td>'+( item.hora_visita ?? 'Sin hora visita' )+'</td>'+
        '<td>'+( item.numeroDocumento ?? 'Sin número de documento' )+'</td>'+
        '<td>'+( item.numeroCaso ?? 'Sin número de caso' )+'</td>'+
        '<td>'+( item.asunto ?? 'Sin asunto' )+'</td>'+
        '<td>'+( item.nombreCliente ?? 'Sin nombre de cliente' )+'</td>'+
        '<td>'+( item.telefono ?? 'Sin teléfono' )+'</td>'+
        '<td>'+( item.representanteVentas ?? 'Sin agente' )+'</td>'+
        '<td>'+( item.monitor ?? 'Sin asignado' )+'</td>'+
        '<td>'+( item.estado ?? 'Sin estado' )+'</td>'+
        '<td>'+( item.prioridad ?? 'Sin prioridad' )+'</td>'+
        '<td>'+( item.motivoCancelacion ?? 'Sin motivo cancelación' )+'</td>'+
        '<td>'+( item.cierrePrevisto ?? 'Sin cierre previsto' )+'</td>'+
        '<td>'+( item.horaCierre ?? 'Sin hora cierre' )+'</td>'+
        '<td>'+( item.origenServicio ? item.origenServicio : 'Sin origen servicio' )+'</td>'+
        '<td>'+( item.tipoServicio ?? 'Sin tipo servicio' )+'</td>'+
        '<td>'+( item.articulo ?? 'Sin artículo' )+'</td>'+
        '<td>'+( item.fechaNotificacion ?? 'Sin fecha notificación' )+'</td>'+
        '<td>'+( item.tipoTransaccion ?? 'Sin tipo transacción' )+'</td>'+
        '<td>'+( item.nota ?? 'Sin nota' )+'</td>'+
        '<td>'+( item.conductorAsignado ?? 'Sin conductor asignado' )+'</td>'+
        '<td>'+( item.metodoPago ?? 'Sin método de pago' )+'</td>'+
        '<td>'+( item.nota_rapida ?? 'Sin nota rápida' )+'</td>'+
        '<td>'+( item.unidad ?? 'Sin unidad' )+'</td>'+
    '</tr>';

    return tr;
}

// Método para mostrar un sweet alert customizado
function loadMsg(type, buttons = true, title, msg = '') {
    // swal({
    //     title: title,
    //     text: msg,
    //     icon: type ?? 'info',
    //     buttons: buttons,
    //     closeOnEsc: false,
    //     // dangerMode: true,
    // })

    let swalObj = {
        title: title,
        buttons: buttons,
        closeOnEsc: false,
        closeOnClickOutside: false,
        content: {
            element: "div",
            attributes: {
                innerHTML:"<i class='fa-solid fa-spinner fa-spin fa-2x'></i>"
            },
        }
    };

    // El contenido se reemplazará en caso de tener un mensaje por defecto
    if ( msg ) {
        swalObj['content'] = {
            element: "div",
            attributes: {
                innerHTML: msg
            },
        }
    }

    swal(swalObj).catch(swal.noop);
}
// Fin de código de Conrado y Christian