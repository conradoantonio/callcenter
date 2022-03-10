// Se inyecta la información del usuario logueado
$('span.user-name').text(userName);
$('span#role').text(userRole);

// Evento que dispara la búsqueda de un cliente
$('input#buscarCliente').on('keypress',function(e) {
    if( e.which == 13 ) {
        loadMsg('Espere un momento...');
        searchCustomer( $(this).val() );
    }
});

// Función para filtrar clientes por un texto
function searchCustomer(search) {
    clearCustomerInfo();

    let dataSearchCustomer = {
        "phone"  : search,
        "planta" : $("select#plantas").val(),
    };

    let settings = {
        url    : urlObtenerCliente,
        method : 'POST',
        data   : JSON.stringify(dataSearchCustomer),
    }

    setAjax(settings).then((response) => {
        swal.close();
        console.log('Cliente encontrado', response);
        customerGlobal = response.data[0];
        setCustomerInfo(response.data[0]);
        $('#agregarDireccion').attr('disabled', false);
    }).catch((error) => {
        infoMsg('error', 'Cliente no encontrado', 'Verifique que la información sea correcta');
        // Limpia los campos de cliente
        customerGlobal = null;
        clearCustomerInfo();
        console.log(error);
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
                    '<option '+(direcciones[key].defaultShipping ? 'selected' : '')+' data-address='+"'"+JSON.stringify(direcciones[key])+"'"+' value="'+direcciones[key].idAdress+'">'+textoDireccion+'</option>'
                );
            }
        }
    }
    if ( direccionDefault?.typeService ) {
        $('#tipoServicioCliente').text(direccionDefault.typeService);
    }

    // Obtiene los casos y oportunidades del cliente
    getCasosOportunidades();

    // Se obtienen los datos de la colonia
    setColoniaZonaData(direccionDefault);
    console.log(direccionDefault);
    // getColoniaZona(direccionDefault?.colonia, direccionDefault?.zip);
}

// Setea los datos de la dirección actual seleccionada del cliente
function setColoniaZonaData(direccion) {
    // Estos campos están en la tarjeta de cliente
    $('#zonaVentaCliente').text('Sin Zona de Venta');
    $('#zonaPrecioCliente').text('Sin Zona de Precio');
    $('#rutaCliente').text("Sin ruta");
    
    // Estos campos están en el formulario de pedido
    $('#zonaVentaPedido, #desdePedido, #hastaPedido').val('');

    let zonaRuta = direccion.dataZoneRoute;
    // console.log('Esta es la data de la zona:', zonaRuta);
    let ruta = zonaRuta.nameUbicacionCil;
    let splitRuta = ruta.split(" : ");
    let desde = direccion.ptg_entre_addr;
    let hasta = direccion.ptg_y_addr;
    let horaInicioFormateada = horaFinFormateada = horas = null;

    $('#zonaVentaCliente').text(zonaRuta.zona_venta);
    $('#zonaPrecioCliente').text('$'+zonaRuta.precio);
    $('#rutaCliente').text(splitRuta[1] ?? "Sin ruta");
    $('#zonaVentaPedido').val(zonaRuta?.zona_venta);

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
}

// Obtiene la información de la zona acorde a la colonia por default del cliente
function getColoniaZona(colonia, zip) {
    let zona = null;
    let url  = urlObtenerZonas.concat('&zip='+zip+'&colonia='+colonia);
    let settings = {
        url      : url,
        method   : 'GET',
        data     : null,
    }

    setAjax(settings).then((response) => {
        let data = response.data;
        // console.log('Esta es la data de la zona:', data);
        let ruta = data[0].nameUbicacionCil;
        let splitRuta = ruta.split(" : ");
        let desde = customerGlobal.desde;
        let hasta = customerGlobal.hasta;
        let horaInicioFormateada = horaFinFormateada = horas = null;

        $('#zonaVentaCliente').text(data[0].id);
        $('#zonaPrecioCliente').text('$'+data[0].precio);
        $('#rutaCliente').text(splitRuta[1] ?? "Sin ruta");
        $('#zonaVentaPedido').val(data[0]?.id);

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
    }).catch((error) => {
        console.log(error);
    });
}

// Función para configurar el formato / texto de la dirección de un cliente
function setDir(direccion) {
    let str = '';

    str += direccion.nameStreet;
    direccion.numExterno ? str+= ' #'+direccion.numExterno : '';
    direccion.colonia    ? str+= ', Col. '+direccion.colonia : '';
    direccion.stateName  ? str+= ', '+direccion.stateName : '';
    direccion.city       ? str+= ', '+direccion.city : '';
    direccion.zip        ? str+= ', C.P. '+direccion.zip : '';

    return str;
}

// Función para obtener las plantas
function getPlantas() {
    let dataPlantas = {
        "requestType" : 'getPlantas'
    };

    let settings = {
        url      : urlPlantas,
        method   : 'GET',
        data     : JSON.stringify(dataPlantas),
    }

    setAjax(settings).then((response) => {
        setSelectPlants((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Función para obtener los artículos
function getArticulos() {
    let settings = {
        url      : urlObtenerArticulos,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        setSelectArticulos((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Función para obtener los tipos de pago
function getMetodosPago() {
    let settings = {
        url      : getMethodPayments,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        setSelectMetodosPago((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Función para obtener la lista de origen del servicio
function getServiceOrigin() {
    let settings = {
        url      : urlGetServicesOriginList,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        setSelectServiceOrigin((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Función para obtener los giros de negocio
function getBusinessType() {
    let settings = {
        url      : urlGetBusinessType,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        setSelectBusinessType((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Pobla los selects dinámicos de los formularios
getPlantas();
getArticulos();
getMetodosPago();
getServiceOrigin();
getBusinessType();

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

// Método para llenar los select de artículos
function setSelectArticulos(items) {
    if ( items.length ) {
        $('select#articuloFrecuenteCilFormCliente, select#articuloFrecuenteEstFormCliente').children('option').remove();
        // $('select#articuloFrecuenteEstFormCliente').children('option').remove();
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                if (items[key].tipo_articulo == 1) {// Cilindro
                    $("select#articuloFrecuenteCilFormCliente").append(
                        '<option value='+items[key].id+'>'+items[key].nombre+'</option>'
                    );
                } else if (items[key].tipo_articulo == 2) {// Estacionario
                    $("select#articuloFrecuenteEstFormCliente").append(
                        '<option value='+items[key].id+'>'+items[key].nombre+'</option>'
                    );
                }
            }
        }
    } else {
        console.warn('No hay artículos por cargar');
    }
}

// Método para llenar el select de método de pago
function setSelectMetodosPago(items) {
    $('select#metodoPagoPedido').children('option').remove();
    if ( items.length ) {
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#metodoPagoPedido").append(
                    '<option value='+items[key].id+'>'+items[key].method+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay métodos de pago por cargar');
    }
}

// Método para llenar el select de origen de servicio
function setSelectServiceOrigin(items) {
    $('select#origenPedido').children('option').remove();
    if ( items.length ) {
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#origenPedido").append(
                    '<option value='+items[key].id+'>'+items[key].name+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay registros por cargar');
    }
}

// Método para llenar el select de giro de negocio
function setSelectBusinessType(items) {
    $('select#giroNegocioFormCliente').children('option').remove();
    if ( items.length ) {
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#giroNegocioFormCliente").append(
                    '<option value='+items[key].id+'>'+items[key].name+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay registros por cargar');
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


// Función y ajax para obtener los pedidos
function getCasosOportunidades() {
    let dataObtenerPedido = {
        "id" : $("#idCliente").text()
    };

    let settings = {
        url      : urlObtenerPedidos,
        method   : 'POST',
        data     : JSON.stringify(dataObtenerPedido),
    }

    // Se remueven registros previos
    $('div#historic-data table.table-gen tbody').children('tr').remove();

    setAjax(settings).then((response) => {
        console.log('pedidos obtenidos exitósamente', response);
            setHistoricTable(JSON.parse(response.data));
    }).catch((error) => {
        console.log('Error en la consulta', error);
    });
}

// Valida el contenido de casos y oportunidades y llama la función setTrOppCases
function setHistoricTable( data ) {
    $('div#historic-data').fadeOut();
    let casos         = data.casos;
    let oportunidades = data.oportunidades;

    // Checa casos
    if ( casos.length ) {
        for ( var key in casos ) {
            if ( casos.hasOwnProperty( key ) ) {
                $('div#historic-data table.table-gen tbody').append(
                    setTrOppCases( casos[key] )
                );
            }
        }
    } else {
        console.warn('No hay casos por cargar');
    }

    // Checa oportunidades
    if ( oportunidades.length ) {
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
        '<td></td>'+
        '<td>'+
        '   <div class="text-center">'+
                '<input class="form-check-input" type="checkbox" value="" id="'+item.id_Transaccion+'">'+
            '</div>'+
        '</td>'+
        '<td><button class="btn btn-danger"></button></td>'+
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

// Método para limpiar la data del cliente cuando falla una búsqueda
function clearCustomerInfo () {
    // Inhabilita el botón de agregar dirección
    $('#agregarDireccion').attr('disabled', true);

    // Se reinician los labels
    $('#idCliente').text('0');
    $('#nombreCliente').text('Busque un cliente');
    $('#telefonoCliente').text('Sin teléfono');
    $('#giroCliente').text('Sin giro');
    $('#contratoCliente').text('Pendiente de validar');
    $('#zonaVentaCliente').text('Sin Zona de Venta');
    $('#zonaPrecioCliente').text('Sin Zona de Precio');
    $('#notasCliente').text('Sin Notas');
    $('#tipoCliente').text('Sin tipo cliente');
    $('#tipoServicioCliente').text('Sin servicio');
    $('#rutaCliente').text('Sin ruta');

    // Se reinicia el select de las direcciones
    $('select#direccionCliente').children('option').remove();
    $('select#direccionCliente').append('<option>Sin direcciones</option>');

    // Se quitan los casos y oportunidades
    $('div#historic-data table.table-gen tbody').children('tr').remove();

    // Se remueven los datos personalizados del cliente del form de pedidos
    $('#desdePedido, #hastaPedido, #zonaVentaPedido').val('');

    customerGlobal = null;
}

// Muestra un mensaje de cargando...
function loadMsg(msg = 'Espere un momento porfavor...') {
    
    let swalObj = {
        title: msg,
        buttons: false,
        closeOnEsc: false,
        closeOnClickOutside: false,
        content: {
            element: "div",
            attributes: {
                innerHTML:"<i class='fa-solid fa-spinner fa-spin fa-2x'></i>"
            },
        }
    };

    swal(swalObj).catch(swal.noop);

}

// Muestra un sweetalert personalizado
function infoMsg(type, title, msg = '', timer = null) {

    let swalObj = {
        title: title,
        icon: type ?? 'info',
        // buttons: false,
        closeOnEsc: false,
        closeOnClickOutside: false,
        timer: timer,
        content: {
            element: "div",
            attributes: {
                innerHTML:"<p class='text-response'>"+msg ?? "¡Cambios guardados exitosamente!"+"</p>"
            },
        }
    };

    swal(swalObj).catch(swal.noop);
}

function confirmMsg(type, title, callback) {

    let swalObj = {
        title: title,
        icon: type ?? 'info',
        buttons:["Cancelar", "Aceptar"],
        closeOnEsc: false,
        closeOnClickOutside: false,
    };

    swal(swalObj).then((resp) => {
        callback(resp);
    }).catch(swal.noop);
}

// Call a global ajax method
// function setAjax(settings) {
//     $.ajax({
//         url: settings.url,
//         method: settings.method,
//         contentType: 'application/json',
//         data: settings.data ?? null,
//         // data: JSON.stringify(content),
//         dataType: 'json',
//         success: function (response) {
//             let msg = '';
//             if ( response.success ) {
//                 if ( settings.callback ) {
//                     window[settings.callback](response, settings);
//                 } else {
//                     msg = response.msg ? response.msg : 'Información procesada exitósamente';
//                     infoMsg('success', msg);
//                 }
//             } else {
//                 msg = response.msg ? response.msg : 'Algo salió mal';
//                 infoMsg('error', msg);
//             }

//         }, error: function (xhr, status, error) {
//             infoMsg('error', 'Algo salió mal.');
//             console.log('Error en la consulta', xhr, status, error);
//         }
//     });
// }

function setAjax(settings) {
    // Generamos el AJAX dinamico para las peticiones relacionadas con peddos
    return new Promise((resolve, reject) => {
        $.ajax({
            url: settings.url,
            method: settings.method,
            data: settings.data ?? null,
            // data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) {
                if ( response.success ) {
                    resolve(response);
                } else {
                    reject(response);
                    swal.close();
                    msg = response.msg ? response.msg : 'La petición no devolvió datos';
                    console.log('info', msg);
                    // infoMsg('info', msg);
                }
            }, error: function (xhr, status, error) {
                console.error('mensaje de error');
                reject({ xhr: xhr, status: status, error: error });
            }
        });
    });
}