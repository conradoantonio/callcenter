// Se inyecta la información del usuario logueado
$('.user-name').text(userName);
$('#role').text(userRole);

// Función para obtener los motivos de cancelar pedido
function getListCancellReason() {
    let dataListCancellReason = {
        "requestType" : 'getListCancellReason'
    };

    let settings = {
        url      : urlGetListCancellReason,
        method   : 'GET',
        data     : JSON.stringify(dataListCancellReason),
    }

    setAjax(settings).then((response) => {
        setSelectListCancellReason((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

function getMethodPayments() {
    let dataListMethodPayments = {
        "requestType" : 'getMethodPayments'
    };

    let settings = {
        url      : urlGetMethodPayments,
        method   : 'GET',
        data     : JSON.stringify(dataListMethodPayments),
    }

    setAjax(settings).then((response) => {
        if(response.success) {
            response.data.forEach(element => {
                methodPayments.push(element);
            });
        }
    }).catch((error) => {
        console.log(error);
    });
}

// Método para llenar el select de los motivos de cancelar pedido
function setSelectListCancellReason(items) {
    if ( items.length ) {
        $('#cancelarOppMotivo').children('option').remove();
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("#cancelarOppMotivo").append(
                    '<option value='+items[key].id+'>'+items[key].name+'</option>'
                );
            }
        }
        readyInit();
    } else {
        console.warn('No hay plantas por cargar');
        readyInit();
    }
}

// Función para obtener los motivos de cancelar pedido
function getListSuppEmp() {
    let dataListSuppEmp = {
        "requestType" : 'getListSuppEmp'
    };

    let settings = {
        url      : urlGetListSuppEmp,
        method   : 'GET',
        data     : JSON.stringify(dataListSuppEmp),
    }

    setAjax(settings).then((response) => {
        setSelectListSuppEmp((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Método para llenar el select de los motivos de cancelar pedido
function setSelectListSuppEmp(items) {
    if ( items.length ) {
        $('#asignarTecnicoFugaQueja, #responsableQueja').children('option').remove();
        $('#asignarTecnicoFugaQueja, #responsableQueja').append('<option value="0">Seleccione una opción</option>');
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("#asignarTecnicoFugaQueja, #responsableQueja").append(
                    '<option value='+items[key].id+'>'+items[key].name+'</option>'
                );
            }
        }
        $('#asignarTecnicoFugaQueja, #responsableQueja').select2({
            selectOnClose: true,
            language: {
                "noResults": function(){
                    return "Sin resultados encontrados";
                }
            }
        });
        readyInit();
    } else {
        console.warn('No hay plantas por cargar');
        readyInit();
    }
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
        getRutas();
        getListTravel();
        readyInit();
    } else {
        console.warn('No hay plantas por cargar');
        readyInit();
    }
}

function getListTravel() {
    let settings = {
        url      : urlGetListTravelNumber,
        method   : 'POST',
        data: JSON.stringify({
            namePlanta : $("#plantas option:selected").text()
        })
    }

    setAjax(settings).then((response) => {
        $('#articuloFugaQueja, #viajeVentaPedido').children('option').remove();
        if(response.success) {
            response.data.forEach(element => {
                $("#asignarViajeRuta, #viajeVentaPedido").append(
                    '<option value="'+element.nViajeId+'">'+element.nViaje +' - '+element.ruta+'</option>'
                );
            });
        }
        $('#asignarViajeRuta').select2({
            selectOnClose: true,
            placeholder: "Seleccione un viaje",
            dropdownParent: $('#asignarViajeModal'),
            language: {
                "noResults": function(){
                    return "Sin resultados encontrados";
                }
            }
        });
        $('#viajeVentaPedido').select2({
            selectOnClose: true,
            placeholder: "Seleccione un viaje",
            language: {
                "noResults": function(){
                    return "Sin resultados encontrados";
                }
            }
        });
        readyInit();
    }).catch((error) => {
        readyInit();
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
        readyInit();
        console.log(error);
    });
}

function setSelectArticulos(items) {
    if ( items.length ) {
        $('#articuloFugaQueja').children('option').remove();
        $('#articuloFugaQueja').append('<option value="">Seleccione una opción</option>')
        // $('select#articuloFrecuenteEstFormCliente').children('option').remove();
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                let articulo = '<option value='+items[key].id+' data-articulo=' + "'" + JSON.stringify(items[key]) + "'" + '>'+items[key].nombre+'</option>';

                if ( [1,2].includes(Number(items[key].tipo_articulo)) ) {
                    $("select#articuloFugaQueja").append( articulo );
                }
            }
        }
        readyInit();
    } else {
        readyInit();
        console.warn('No hay artículos por cargar');
    }
}

// Función para obtener los estado de la oportunidad
function getStatusOportunidad() {
    let settings = {
        url      : urlStatusOp,
        method   : 'GET'
    }

    setAjax(settings).then((response) => {
        setSelectStatusOp((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

vrStatus = [];
// Método para llenar el select de los estado de la oportunidad
function setSelectStatusOp(items) {
    vrStatus = [];
    if ( items.length ) {
        $('#filterEstadoSolicitud').children('option').remove();
        $('#filterEstadoSolicitud').append(
            '<option value="0">Todos</option>'
        )
        for ( var key in items ) {
            vrStatus.push(items[key]);
            if ( items.hasOwnProperty( key ) && items[key].id != "6") {
                $("#filterEstadoSolicitud").append(
                    '<option value="'+items[key].id+'">'+items[key].nombre+'</option>'
                );
            }
        }
        readyInit();
    } else {
        console.warn('No hay estados de solicitud por cargar');
        readyInit();
    }
}

rutasCilindros = [];
rutasEstacionarios = [];

// Función para obtener los estado de la oportunidad
function getRutas(getPedidos = false) {
    if(getPedidos) {
        loadMsg();
    }
    let settings = {
        url      : urlRutas,
        method   : 'POST',
        data: JSON.stringify({
            namePlanta : $("#plantas option:selected").text()
        })
    }

    setAjax(settings).then((response) => {
        if(response.success) {
            rutasCilindros = response.rutaCilindro;
            rutasEstacionarios = response.rutaEstacionario;
            setSelectRutas(getPedidos);
        }        
    }).catch((error) => {
        console.log(error);
    });
}

// Método para llenar el select de los estado de la oportunidad
function setSelectRutas(getPedidos = false) {
    $('#filterRuta').parent().parent().removeClass("d-none");
    $('#filterRuta').children('option').remove();    
    if ( rutasCilindros.length || rutasEstacionarios.length) {        
        if($("#filterTipoProducto").val() == "0" || $("#filterTipoProducto").val() == "1") {
            rutasCilindros.forEach(element => {
                $("#filterRuta").append(
                    '<option value="'+element.internalId+'">'+element.name+'</option>'
                );
            });
        }
        if($("#filterTipoProducto").val() == "0" || $("#filterTipoProducto").val() == "2") {
            rutasEstacionarios.forEach(element => {
                $("#filterRuta").append(
                    '<option value="'+element.internalId+'">'+element.name+'</option>'
                );
            });
        }
        if($("#filterTipoProducto").val() == "3") {
            $('#filterRuta').parent().parent().addClass("d-none");
        }
        $('#filterRuta').select2({
            selectOnClose: true,
            placeholder: "Seleccione una opción",
            language: {
                "noResults": function(){
                    return "Sin resultados encontrados";
                }
            }
        });
        if(getPedidos) {
            getServicios(this);
        }        
        readyInit();
    } else {
        console.warn('No hay rutas por cargar');
        readyInit();
    }
}

// Función para obtener los tipos de servicios
function getTiposServicios() {
    let settings = {
        url      : urlTiposServicios,
        method   : 'GET'
    }

    setAjax(settings).then((response) => {
        setSelectTiposServicios((response.data));
    }).catch((error) => {
        console.log(error);
    });
}
vrTiposServicios = [];
// Método para llenar el select de los estado de la oportunidad
function setSelectTiposServicios(items) {
    vrTiposServicios = [];
    if ( items.length ) {
        $('#filterTipoProducto').children('option').remove();
        $('#filterTipoProducto').append(
            '<option value="0">Todos</option>'
        )
        for ( var key in items ) {
            vrTiposServicios.push(items[key]);
            if ( items.hasOwnProperty( key ) && items[key].id != "4") {
                $("#filterTipoProducto").append(
                    '<option value="'+items[key].id+'">'+items[key].nombre+'</option>'
                );
            }
        }
        readyInit();
    } else {
        console.warn('No hay tipos de servicio por cargar');
        readyInit();
    }
}

// Call a global ajax method
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

var globalTimeout = null;  

function getServiciosDelay($event) {
    if (globalTimeout != null) {
        clearTimeout(globalTimeout);
    }
    globalTimeout = setTimeout(function() {
        globalTimeout = null;  
        //ajax code
        getServicios($event)
    }, 1000);  
}

function getFiltPedidos() {
    let filt = {};

    if($("#filterTipoServicio").val() == "pedidos") {
        if($("#filterFechaSolicitudIni").val()) {
            filt.fechaSolicitud1 = dateFormatFromDate($("#filterFechaSolicitudIni").val(), "5");
        }
      
        if($("#filterFechaSolicitudFin").val()) {
            filt.fechaSolicitud2 = dateFormatFromDate($("#filterFechaSolicitudFin").val(), "5");
        }

        if($("#filterFechaPrometidaIni").val()) {
            filt.fechaPrometida1 = dateFormatFromDate($("#filterFechaPrometidaIni").val(), "5");
        }
      
        if($("#filterFechaPrometidaFin").val()) {
            filt.fechaPrometida2 = dateFormatFromDate($("#filterFechaPrometidaFin").val(), "5");
        }

        if($("#filterEstadoSolicitud").val() != "0") {
            filt.status_oportunidad = $("#filterEstadoSolicitud").val();
        }

        if($("#filterTipoProducto").val() != "3" && $("#filterRuta").val()) {
            //filt.ruta = $("#filterRuta").val();
        }

        if($("#filterTipoProducto").val() != "0") {
            filt.tipo_producto = parseInt($("#filterTipoProducto").val());
        }

        if($("#filterSegundaLlamada").prop('checked')) {
            filt.segunda_llamada = "T";
        }

        if($("#filterProgramado").prop('checked')) {
            filt.programado = true;
        }

        if($("#filterBuscarCliente").val().trim()) {
            if($("#filterDatosCliente").val() == "name") {
                filt.name = $("#filterBuscarCliente").val().trim();
            } else if($("#filterDatosCliente").val() == "phone") {
                filt.phone = $("#filterBuscarCliente").val().trim();
            } else if($("#filterDatosCliente").val() == "email") {
                filt.email = $("#filterBuscarCliente").val().trim();
            }  
        } else if ($("#filterBuscarCalle").val().trim() || $("#filterBuscarInt").val().trim() || $("#filterBuscarExt").val().trim()) {
            if($("#filterDatosCliente").val() == "address") {
                if($("#filterBuscarCalle").val().trim()) {
                    filt.calle = $("#filterBuscarCalle").val().trim();
                } 
                if($("#filterBuscarInt").val().trim()) {
                    filt.nInt = $("#filterBuscarInt").val().trim();
                } 
                if($("#filterBuscarExt").val().trim()) {
                    filt.nExt = $("#filterBuscarExt").val().trim();
                }
            } 
        }
    } else {
        if($("#filterFechaSolicitudIni").val()) {
            filt.fechaSolicitud1 = dateFormatFromDate($("#filterFechaSolicitudIni").val(), "5");
        }
    
        if($("#filterFechaSolicitudFin").val()) {
            filt.fechaSolicitud2 = dateFormatFromDate($("#filterFechaSolicitudFin").val(), "5");
        }

        if($("#filterTipoServicio").val() == "queja") {
            filt.tipo_servicio = "2";
        } else {
            filt.tipo_servicio = "1";
        }

        if($("#filterEstadoCaso").val() != "0") {
            filt.estado = $("#filterEstadoCaso").val();
        }

        filt.prioridad = $("#filterPrioridad").val();

        if($("#filterBuscarCliente").val().trim()) {
            if($("#filterDatosCliente").val() == "name") {
                filt.nombre_cliente = $("#filterBuscarCliente").val().trim();
            } else if($("#filterDatosCliente").val() == "phone") {
                filt.telefono = $("#filterBuscarCliente").val().trim();
            } else if($("#filterDatosCliente").val() == "email") {
                filt.email_cliente = $("#filterBuscarCliente").val().trim();
            }  
        } else if ($("#filterBuscarCalle").val().trim() || $("#filterBuscarInt").val().trim() || $("#filterBuscarExt").val().trim()) {
            if($("#filterDatosCliente").val() == "address") {
                if($("#filterBuscarCalle").val().trim()) {
                    filt.calle = $("#filterBuscarCalle").val().trim();
                } 
                if($("#filterBuscarInt").val().trim()) {
                    filt.nInt = $("#filterBuscarInt").val().trim();
                } 
                if($("#filterBuscarExt").val().trim()) {
                    filt.nExt = $("#filterBuscarExt").val().trim();
                }
            } 
        }
    }    

    return filt;
}

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

function infoMsg(type, title, msg = '', timer = null, callback = null) {

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

    if(callback) {
        swal(swalObj).then((resp) => {
            callback(resp);
        }).catch(swal.noop);
    } else {
        swal(swalObj).catch(swal.noop);
    }
}

// Función para obtener los diferentes tipos de servicios
function getServicios($event) {
    if($event) {
        if($($event).attr("id") == "filterDatosCliente") {
            if($("#filterDatosCliente").val() != "address" && $("#filterBuscarCliente").val().trim() == "") {
                return;
            } else if($("#filterDatosCliente").val() == "address" && $("#filterBuscarCalle").val().trim() == "" && $("#filterBuscarInt").val().trim() == "" && $("#filterBuscarExt").val().trim() == "") {
                return;
            }
        }        
    }
    if($("#filterTipoServicio").val() == "pedidos") {
        let settings = {
            url      : urlGetOpp,
            method   : 'POST',
            data: JSON.stringify(getFiltPedidos())
        }
        if(!swal.getState().isOpen) {
            loadMsg();
        }
        
        $("#tablePedidos tbody").children("tr").remove();
        setAjax(settings).then((response) => {        
            if(response.success) {
                response.data = removeDuplicates(response.data, 'no_pedido');
                if(response.data.length == 0) {
                    $("#tablePedidos tbody").append('<tr><td colspan="17" class="text-center fw-bold py-5">Sin pedidos encontrados</td></tr>');
                    initTable("tablePedidos");
                }
                response.data.forEach((pedido, position) => {
                    if(pedido.fecha_prometida) {
                        pedido.fecha_hora_prometida = dateFormatFromString(pedido.fecha_prometida, "2");
                        pedido.fecha_prometida = dateFormatFromDate(new Date(pedido.fecha_prometida.split("/")[2], parseInt(pedido.fecha_prometida.split("/")[1]) - 1, pedido.fecha_prometida.split("/")[0]), "2");
                    }
            
                    if(pedido.fecha_solicitud) {
                        pedido.fecha_solicitud = dateFormatFromDate(new Date(pedido.fecha_solicitud.split("/")[2], parseInt(pedido.fecha_solicitud.split("/")[1]) - 1, pedido.fecha_solicitud.split("/")[0]), "2");
                    }
                                
                    if(pedido.fecha_notificacion) {
                        pedido.fecha_hora_notificacion = dateFormatFromString(pedido.fecha_notificacion+(pedido.hora_notificacion ? " "+pedido.hora_notificacion : ''), "2");
                        pedido.fecha_notificacion = dateFormatFromDate(new Date(pedido.fecha_notificacion.split("/")[2], parseInt(pedido.fecha_notificacion.split("/")[1]) - 1, pedido.fecha_notificacion.split("/")[0]), "2");
                    }
                    vrStatus.forEach(element2 => {
                        if(element2.id == pedido.status_id) {
                            pedido.estado = element2.nombre;
                        }
                    });
                    if(pedido.desde) {
                        pedido.desde = getTimeFromString(pedido.desde);
                    }
                    if(pedido.hasta) {
                        pedido.hasta = getTimeFromString(pedido.hasta);
                    }
                });
                response.data.sort(dynamicSort("fecha_hora_prometida"));
                response.data = orderOrders(response.data);
                $("#tablePedidos thead tr th").css('z-index', "3");
                $($("#tablePedidos thead tr th")[0]).css('z-index', "4");
                $($("#tablePedidos thead tr th")[1]).css('z-index', "4");
                $($("#tablePedidos thead tr th")[2]).css('z-index', "4");
                response.data.forEach((pedido, position) => {
                    let trAux = '<tr data-item='+"'"+JSON.stringify(pedido)+"'"+'>'+
                                    '<td class="text-center sticky-col">'+  
                                        '<div class="btn-group dropend vertical-center">'+                                            
                                            '<i class="fa-solid fa-ellipsis-vertical c-pointer dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 24px;"></i>'+
                                            '<ul class="dropdown-menu">'+
                                                '<li onclick="verDetalles(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-eye color-primary"></i> Ver detalles</li>'+
                                                '<li onclick="gestionarServicio(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-gears color-primary"></i> Gestionar servicio</li>'+
                                                ((pedido.servicio == "1" || pedido.servicio == "2") ? '<li onclick="asignarViaje(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-route color-primary"></i> Asignar viaje(ruta)</li>' : '')+
                                                '<li onclick="notificarPedido(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-bell color-primary"></i> Notificar servicio</li>'+
                                                '<li onclick="seguimientoPedido(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-comment-dots color-primary"></i> Seguimiento</li>'+
                                                '<li onclick="cancelarPedido(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-circle-xmark text-danger"></i> Cancelar servicio</li>'+
                                            '</ul>'+
                                        '</div>'+
                                        '<div style="position: absolute; right: 0; top: 0; height: 100%; width: 1px; background-color: #000;"></div>'+
                                    '</td>'+
                                    '<td style="left: 40px;"class="text-center sticky-col">'+
                                        '<button class="btn" style="cursor: default; background: '+pedido.status_color+';"></button>'+
                                    //(pedido.status_color ? '<i class="'+(pedido.outline ? 'fa-regular' : 'fa-solid')+' fa-square vertical-center" style="color: '+pedido.status_color+';"></i>': '')+
                                        '<div style="position: absolute; right: 0; top: 0; height: 100%; width: 1px; background-color: #000;"></div>'+
                                    '</td>'+
                                    '<td style="left: 80px;"class="text-center sticky-col">'+
                                        '<input type="checkbox" class="form-check-input form-ptg vertical-center" ' + (pedido.segunda_llamada ? 'checked' : '') + ' disabled style="width: fit-content;">'+
                                        '<div style="position: absolute; right: 0; top: 0; height: 100%; width: 1px; background-color: #000;"></div>'+
                                    '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + pedido.no_pedido + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + pedido.id_cliente + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.tipo_cliente ? pedido.tipo_cliente : 'Sin tipo de cliente') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + dateFormatFromDate(pedido.fecha_solicitud, '5') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + dateFormatFromDate(pedido.fecha_prometida, '5') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + pedido.estado + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.nombre_cliente ? pedido.nombre_cliente : 'Sin nombre de cliente') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.telefono ? pedido.telefono : 'Sin teléfono') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.zona ? pedido.zona : 'Sin zona') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? pedido.contrato.trim() : 'Sin contrato') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.nombre_vehiculo.trim() ? pedido.nombre_vehiculo.trim() : 'Sin asignar') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.colonia ? pedido.colonia : 'Sin colonia') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.direccion ? pedido.direccion : 'Sin dirección') + '</td>'+
                                    '<td class="text-center '+(pedido.tipoContratoId && pedido.tipoContratoId.trim() && pedido.tipoContratoId == "2" ? 'text-danger': '')+'">' + (pedido.observaciones ? pedido.observaciones : 'Sin observaciones') + '</td>'+
                                '</tr>';
                    $("#tablePedidos tbody").append(trAux);

                    if(response.data.length == (position + 1)) {
                        initTable("tablePedidos");
                    }
                });
                swal.close();
            } else {
                $("#tablePedidos tbody").append('<tr><td colspan="17" class="text-center fw-bold py-5">Sin pedidos encontrados</td></tr>');
                swal.close();
            }
        }).catch((error) => {
            console.log(error);
            $("#tablePedidos tbody").append('<tr><td colspan="17" class="text-center fw-bold py-5">Sin pedidos encontrados</td></tr>');
            swal.close();
        });
    } else {
        let settings = {
            url      : urlGetCasos,
            method   : 'POST',
            data: JSON.stringify(getFiltPedidos())
        }
        if(!swal.getState().isOpen) {
            loadMsg();
        }
        
        $("#tableCasos tbody").children("tr").remove();
        setAjax(settings).then((response) => {    
            if(response.success) {
                if(response.data.length == 0) {
                    $("#tableCasos tbody").append('<tr><td colspan="11" class="text-center fw-bold py-5">Sin casos encontrados</td></tr>');
                    initTable("tableCasos");
                }
                $("#tableCasos thead tr th").css('z-index', (response.data.length + 1));
                $($("#tableCasos thead tr th")[0]).css('z-index', (response.data.length + 2));
                response.data.forEach((caso, position) => {
                    let trAux = '<tr data-item='+"'"+JSON.stringify(caso)+"'"+'>'+
                                    '<td class="text-center sticky-col" style="z-index: '+(response.data.length - position)+';">'+  
                                        '<div class="btn-group dropend vertical-center">'+                                            
                                            '<i class="fa-solid fa-ellipsis-vertical c-pointer dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 24px;"></i>'+
                                            '<ul class="dropdown-menu">'+
                                                '<li onclick="gestionarCaso(this)" class="px-2 py-1 c-pointer" style="font-size: 16px"><i class="fa-solid fa-gears color-primary"></i> Gestionar '+(caso.tipo_servicio == "2" ? 'queja' : 'fuga')+'</li>'+
                                            '</ul>'+
                                        '</div>'+
                                        '<div style="position: absolute; right: 0; top: 0; height: 100%; width: 1px; background-color: #000;"></div>'+
                                    '</td>'+
                                    '<td class="text-center">' + caso.numero_caso + '</td>'+
                                    '<td class="text-center">' + caso.id_cliente + '</td>'+
                                    '<td class="text-center">' + (caso.tipo_servicio == "2" ? 'Queja' : 'Fuga') + '</td>'+
                                    '<td class="text-center">' + (caso.estado == "1" ? 'No iniciado' : caso.estado == "2" ? 'En curso' : caso.estado == "3" ? 'Escalado' : caso.estado == "4" ? 'Reabierto' : caso.estado == "5" ? 'Cerrado' : '') + '</td>'+
                                    '<td class="text-center">' + caso.fecha_solicitud + '</td>'+
                                    '<td class="text-center">' + (caso.prioridad == "1" ? 'Alto' : caso.prioridad == "2" ? 'Medio' : 'Bajo') + '</td>'+
                                    '<td class="text-center">' + (caso.concepto_casos_name ? caso.concepto_casos_name : 'Sin concepto') + '</td>'+
                                    '<td class="text-center">' + (caso.nombre ? caso.nombre : 'Sin nombre de cliente') + '</td>'+
                                    '<td class="text-center">' + (caso.telefono ? caso.telefono : 'Sin teléfono') + '</td>'+
                                    '<td class="text-center">' + (caso.direccion_casos ? caso.direccion_casos : 'Sin dirección') + '</td>'+
                                '</tr>';
                    $("#tableCasos tbody").append(trAux);
                    if(response.data.length == (position + 1)) {
                        initTable("tableCasos");
                    }
                });
                swal.close();
            } else {
                $("#tableCasos tbody").append('<tr><td colspan="11" class="text-center fw-bold py-5">Sin casos encontrados</td></tr>');
                swal.close();
            }
        }).catch((error) => {
            console.log(error);
            $("#tableCasos tbody").append('<tr><td colspan="11" class="text-center fw-bold py-5">Sin casos encontrados</td></tr>');
            swal.close();
        });
    }
}

function initTable(table) {
    $("#"+table).fancyTable({
        sortColumn:0,
        pagination: true,
        perPage: table == "tablePedidos" ? ($("#filterCantidad").val() != "0" ? parseInt($("#filterCantidad").val()) : $("#"+table+" tbody").children("tr").length) : 10,
        searchable:false,
        sortable: false
    });
    if ($(".btn-expand").find("i").hasClass('fa-caret-right')) {
        $("tfoot").addClass("expand");
    } else {
        $("tfoot").removeClass("expand");
    }
}

function gestionarServicio($this) {
    let servicio = $($this).closest("tr").data("item");
    console.log(servicio);
    loadMsg();
    if(!$(".btn-expand").find("i").hasClass('fa-caret-right')) {
        $(".btn-expand").trigger("click");
    }
    $("#tipoCasoFuga, #tipoCasoQueja").addClass("d-none");
    $("#sinSeleccionCaso, #data-casos").addClass("d-none");

    $("#dataPedidosCliente").html(servicio.id_cliente + " - " + servicio.nombre_cliente);
    $("#dataPedidosTelefono").html(servicio.telefono.trim());
    $("#dataPedidosDireccion").html(servicio.direccion.trim());

    $("#noPedido").html(servicio.no_pedido);
    $("#fechaSolicitudPedido").html(dateFormatFromDate(servicio.fecha_solicitud, '5'));

    $("#fechaPrometidaPedido").val(dateFormatFromDate(servicio.fecha_prometida, "2"));
    $("#desdePedido").val(servicio.desde ? getTimeFromString(servicio.desde) : null);
    $("#hastaPedido").val(servicio.hasta ? getTimeFromString(servicio.hasta) : null);
    $('#viajeVentaPedido').val(servicio.id_no_viaje).trigger("change");

    $("#zonaVentaPedido").val(servicio.zona);

    $('.productosMetodoPago tbody').children("tr").remove();

    if(servicio.objPagos) {
        let aux = JSON.parse(servicio.objPagos);
        let total = 0;
        if(aux.pago) {
            aux.pago.forEach(element => {
                $(".productosMetodoPago tbody").append(
                    '<tr data-metodo-id='+element.tipo_pago+' class="metodo-item" data-metodo=' + "'" + JSON.stringify(element) + "'" + '>' +
                        '<td>'+getMetodoPagoNombre(element)+'</td>'+
                        '<td class="text-center">'+(element.folio ? element.folio : 'No aplica')+'</td>'+
                        '<td class="text-center" data-total='+element.monto+'>$'+element.monto+' mxn</td>'+
                    '</tr>'
                );
                total = total + parseFloat(element.monto);
            });
        }
        
        total = total.toFixed(2);
        $('.productosMetodoPago').children('tfoot').find('td.total').data('total', total);
        $('.productosMetodoPago').find('td.total').text('$'+total+' mxn');
    }

    console.log(urlGetItemsOpp);

    let settings = {
        url      : urlGetItemsOpp,
        method   : 'POST',
        data     : JSON.stringify({opp : servicio.no_pedido}),
    }

    setAjax(settings).then((response) => {
        if(response.success) {
            $('.productosCilindroPedido, .productosEstacionarioPedido').parent().parent().addClass('d-none');
            $('.productosCilindroPedido tbody, .productosEstacionarioPedido tbody').children("tr").remove();
            var table = $('.productosCilindroPedido');
            response.data.forEach(element => {
                if(element.itemId == deftEstacionarVal) {
                    table = $('.productosEstacionarioPedido');
                }
            });
            table.parent().parent().removeClass('d-none');
            let total = 0;
            response.data.forEach(articulo => {
                articulo.amount = articulo.amount ? parseFloat(articulo.amount) : 0;
                articulo.taxAmount = articulo.taxAmount ? parseFloat(articulo.taxAmount) : 0;
                if(table.hasClass('productosCilindroPedido')) {
                    $(".productosCilindroPedido tbody").append(
                        '<tr data-item-id='+articulo.itemId+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
                            '<td class="text-center">'+articulo.item+'</td>'+
                            '<td class="text-center">'+articulo.quantity+'</td>'+
                            '<td class="text-center">'+articulo.capacidad+' kg</td>'+
                            '<td class="text-center" data-total='+(articulo.amount+articulo.taxAmount)+'>$'+(articulo.amount+articulo.taxAmount).toFixed(2)+' mxn</td>'+
                        '</tr>'
                    );
                } else {
                    $(".productosEstacionarioPedido tbody").append(
                        '<tr data-item-id='+articulo.itemId+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
                            '<td>'+articulo.item+'</td>'+
                            '<td class="text-center">'+articulo.quantity+'</td>'+
                            '<td class="text-center">1</td>'+
                            '<td class="text-center" data-total='+(articulo.amount+articulo.taxAmount)+'>$'+(articulo.amount+articulo.taxAmount)+' mxn</td>'+
                        '</tr>'
                    );
                }
                
                total = total + (articulo.amount+articulo.taxAmount);
            });

            total = total.toFixed(2);
            table.children('tfoot').find('td.total').data('total', total);
            table.children('tfoot').find('td.total').text('$'+total+' mxn');            
        }
        swal.close();
    }).catch((error) => {
        console.log(error);
        swal.close();
    });

    $("#observacionesPagoPedido").val(servicio.observaciones);

    $("#data-pedidos").removeClass("d-none");
    $("#data-pedidos").data("item", servicio);
}

function getMetodoPagoNombre(item) {
    let aux = "No encontrado";
    console.log(item);
    if(item.tipo_pago) {
        methodPayments.forEach(element => {
            if(element.id == item.tipo_pago) {
                aux = element.method;
            }
        });
    }
    return aux;
}

$("#guardarPedido").click(function() {
    let servicio = $("#data-pedidos").data("item");
    if(!$("#fechaPrometidaPedido").val() ||
       !$("#desdePedido").val() ||
       !$("#hastaPedido").val() ||
       !$("#viajeVentaPedido").val()) {
        let aux = "<ul>";
        if(!$("#fechaPrometidaPedido").val()) {
            aux += "<li>Fecha prometida</li>";
        }
        if(!$("#desdePedido").val()) {
            aux += "<li>Desde</li>";
        }
        if(!$("#hastaPedido").val()) {
            aux += "<li>Hasta</li>";
        }
        if(!$("#viajeVentaPedido").val()) {
            aux += "<li>Viaje(ruta)</li>";
        }
        aux += "</ul>";
        infoMsg('warning', 'Campos requeridos:', aux);
        return;
    }
    confirmMsg("warning", "¿Seguro que desea editar el servicio?", function(resp) {
        if(resp) {
            let dataSend = {
                "opportunitiesUpdate": [
                    {
                        "id": servicio.no_pedido,
                        "bodyFields": {
                            "expectedclosedate": dateFormatFromDate($("#fechaPrometidaPedido").val(), "5"),
                            "custbody_ptg_entre_las": formatTime( $('#desdePedido').val() ),
                            "custbody_ptg_y_las" : formatTime( $('#hastaPedido').val()),
                            "custbody_ptg_numero_viaje" : $('#viajeVentaPedido').val(),
                            "memo": $('#observacionesPagoPedido').val()
                        },
                        "lines": [
                            
                        ]
                    }
                ]
            };
            loadMsg();
            let settings = {
                url      : urPutOppMonitor,
                method   : 'PUT',
                data: JSON.stringify(dataSend)
            }
            setAjax(settings).then((response) => {
                if(response.success) {
                    swal.close();
                    infoMsg('success', '', "Servicio guardado de manera correcta", null, function(resp) {
                        $(".btn-expand").trigger("click");
                        getServicios();
                    });  
                } else {
                    swal.close();
                    infoMsg('error', 'Error:', "Ocurrio un error al tratar de editar el servicio");
                }            
            }).catch((error) => {
                infoMsg('error', 'Error:', "Ocurrio un error al tratar de editar el servicio");
                console.log(error);
                swal.close();
            });
        }
    });
});

function gestionarCaso($this) {
    let caso = $($this).closest("tr").data("item");
    $("#dataCasosCliente").html(caso.id_cliente + " - " + caso.nombre);
    $("#dataCasosTelefono").html(caso.telefono.trim());
    $("#dataCasosDireccion").html(caso.direccion_casos.trim());
    $("#dataCasosTipoServicio").html((caso.tipo_servicio == "2" ? 'Queja' : 'Fuga').trim());
    $("#tipoCasoFuga, #tipoCasoQueja").addClass("d-none");
    if(!$(".btn-expand").find("i").hasClass('fa-caret-right')) {
        $(".btn-expand").trigger("click");
    }
    
    $("#sinSeleccionCaso, #data-pedidos").addClass("d-none");

    if(caso.tipo_servicio == "1") {
        $("#tipoCasoFuga").removeClass("d-none");     
        //Reporte
        $("#noCaso").html(caso.numero_caso);
        $("#fechaCaso").html(caso.fecha_solicitud);
        getCasosOportunidades(caso);

        //Domicilio

        //Detalle del caso 
        $("#prioridadFugaQueja").val(caso.prioridad);
        setSelectConceptosCasos(caso);
        getMessageAndNotes(caso);

        //Información del producto
        $("#articuloFugaQueja").val(caso.ariculo).trigger("change");
        $("#capacidadFugaQueja").val(caso.capacidadEstacionario);
        $("#anioFugaQueja").val(caso.yearTanque);
        
        //Programación visita
        $("#fechaVisitaFugaQueja").val(dateFormatFromDate(caso.fecha_visita, "2"));
        $("#horarioPreferidoFugaQueja").val(getTimeFromString(caso.horario_preferido));
        $("#asignarTecnicoFugaQueja").val((caso.asignado_a ? caso.asignado_a : "0")).trigger("change");
  
    } else {
        $("#tipoCasoQueja").removeClass("d-none");

        $("#noQueja").html(caso.numero_caso);
        $("#fechaQueja").html(caso.fecha_solicitud);
        setSelectConceptosCasos(caso);
        getCasosOportunidades(caso);
        getMessageAndNotes(caso);

        //Escalar caso
        $("#prioridadFugaQueja").val(caso.prioridad);
        $("#estadoQueja").val(caso.estado);
        $("#responsableQueja").val((caso.asignado_a ? caso.asignado_a : "0")).trigger("change");
    }
    $("#data-casos").removeClass("d-none");
    $("#data-casos").data("item", caso);
}

function getMessageAndNotes(caso) {
    $("#notasAdicionales tbody, #notasAdicionalesQueja tbody").html("");
    let settings = {
        url      : urlGetMessageandNotes,
        method   : 'POST',
        data     : JSON.stringify({case : caso.internalId}),
    }

    setAjax(settings).then((response) => {
        if(response.success) {
            response.noteData.forEach(element => {
                if(element.note && element.note.trim()) {
                    let trAux = '<tr class="notasAdicionalesItem">' +
                                '<td colspan="2" class="p-2">' +
                                    element.note +
                                '</td>' +
                            '</tr>';
                    $("#notasAdicionales tbody, #notasAdicionalesQueja tbody").append(trAux);
                }
                
            });

            $("#especificacionesFugaQueja, #justificacionQueja").val(response.messageData && response.messageData.length > 0 && response.messageData[0].message && response.messageData[0].message.trim() ? response.messageData[0].message : '');
        }
    }).catch((error) => {
        console.log(error);
    });
}

function setSelectConceptosCasos(caso) {
    $('#conceptoFugaQueja, #conceptoQueja').children('option').remove();
    $('#conceptoFugaQueja, #conceptoQueja').append('<option value="0">Seleccione una opción</option>');
    conceptoFugasQuejasArr.forEach(element => {
        if(caso.tipo_servicio == "1" && element.typeName == 'Fugas') {
            $("#conceptoFugaQueja, #conceptoQueja").append('<option value='+element.id+'>'+element.name+'</option>');
        } else if(caso.tipo_servicio == "2" && element.typeName == 'Quejas') {
            $("#conceptoFugaQueja, #conceptoQueja").append('<option value='+element.id+'>'+element.name+'</option>');
        }
    });
    $('#conceptoFugaQueja, #conceptoQueja').select2({
        selectOnClose: true,
        placeholder: "Seleccione una opción",
        language: {
            "noResults": function(){
                return "Sin resultados encontrados";
            }
        }
    });

    if(caso.concepto_casos.trim()) {
        $('#conceptoFugaQueja, #conceptoQueja').val(caso.concepto_casos.trim()).trigger("change");
    } else {
        $('#conceptoFugaQueja, #conceptoQueja').val("0").trigger("change");
    }
}

// Función para obtener los giros de negocio
function getConceptosCasos() {
    let settings = {
        url      : urlGetConceptosCasos,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        if (response.success) {
            conceptoFugasQuejasArr = response.data;
        }
        readyInit();
        // setselectConceptosCasos((response.data));
    }).catch((error) => {
        console.log(error);
        readyInit();
    });
}

// Función y ajax para obtener los pedidos
function getCasosOportunidades(caso) {
    let dataObtenerPedido = {
        "id" : caso.id_cliente
    };

    let settings = {
        url      : urlObtenerPedidos,
        method   : 'POST',
        data     : JSON.stringify(dataObtenerPedido),
    }

    // Se remueven registros previos
    $('#asociarServicioFugaQueja, #asociarCasoFugaQueja, #asociarServicioQueja, #asociarCasoQueja').children('option').remove();
    $('#asociarServicioFugaQueja, #asociarCasoFugaQueja, #asociarServicioQueja, #asociarCasoQueja').append('<option value="0">Seleccione una opción</option>');

    setAjax(settings).then((response) => {
        // console.log('pedidos obtenidos exitósamente', response);
        setCasosOportunidades(caso, JSON.parse(response.data));
    }).catch((error) => {
        console.log('Error en la consulta', error);
    });
}

// Valida el contenido de casos y oportunidades y llama la función setTrOppCases
function setCasosOportunidades(caso, data ) {
    let casos         = data.casos;
    let oportunidades = data.oportunidades;
    console.log('Caso', caso);
    console.log('Casos', casos);
    console.log('Oportunidades', oportunidades);
    
    // Checa casos
    if ( casos.length ) {
        // numero de documento, fecha
        for ( var key in casos ) {
            if ( casos.hasOwnProperty( key ) && caso.numero_caso != casos[key].numeroCaso) {
                $('#asociarCasoFugaQueja, #asociarCasoQueja').append('<option value="'+casos[key].id_Transaccion+'">No. caso: '+casos[key].numeroCaso+' - Fecha visita: '+casos[key].fecha_visita+'</option>');
            }
        }
    }

    // Checa oportunidades
    if ( oportunidades.length ) {
        for ( var key in oportunidades ) {
            if ( oportunidades.hasOwnProperty( key )) {
                $('#asociarServicioFugaQueja, #asociarServicioQueja').append('<option value="'+oportunidades[key].id_Transaccion+'"> No. documento: '+oportunidades[key].numeroDocumento+' - Fecha: '+oportunidades[key].fecha+'</option>');
            }
        }
    }
    $('#asociarCasoFugaQueja, #asociarCasoQueja').select2({
        selectOnClose: true,
        placeholder: "Seleccione una opción",
        language: {
            "noResults": function(){
                return "Sin resultados encontrados";
            }
        }
    });
    $('#asociarServicioFugaQueja, #asociarServicioQueja').select2({
        selectOnClose: true,
        placeholder: "Seleccione una opción",
        language: {
            "noResults": function(){
                return "Sin resultados encontrados";
            }
        }
    });

    if(caso.relacion_caso.trim()) {
        $('#asociarCasoFugaQueja, #asociarCasoQueja').val(caso.relacion_caso.trim()).trigger("change");
    } else {
        $('#asociarCasoFugaQueja, #asociarCasoQueja').val("0").trigger("change");
    }

    if(caso.idOpp.trim()) {
        $('#asociarServicioFugaQueja, #asociarServicioQueja').val(caso.idOpp.trim()).trigger("change");
    } else {
        $('#asociarServicioFugaQueja, #asociarServicioQueja').val("0").trigger("change");
    }
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

// Regresa el valor de un input tiempicker al formato de netsuite
function formatTime(value, format = 'hh:mm a') {
    let hora = value.split(':');
    let customDateTime = new Date();

    if ( hora.length ) {

        customDateTime.setHours(hora[0]);
        customDateTime.setMinutes(hora[1]);

        return moment(customDateTime).format(format);

    } 

    return '';
}

$("#guardarCaso").click(function() {
    let caso = $("#data-casos").data("item");
    if(caso.tipo_servicio == "1" && !(/*$("#direccionFugaQueja").val() &&*/
       $("#conceptoFugaQueja").val() && $("#conceptoFugaQueja").val() != "0" &&
       $("#prioridadFugaQueja").val() &&
       $("#articuloFugaQueja").val() && $("#articuloFugaQueja").val() != "0" &&
       $("#fechaVisitaFugaQueja").val() &&
       $("#horarioPreferidoFugaQueja").val() &&
       $("#asignarTecnicoFugaQueja").val() && $("#asignarTecnicoFugaQueja").val() != "0")) {
        let aux = "<ul>";
        if(!$("#direccionFugaQueja").val()) {
            aux += "<li>Domicilio</li>";
        }
        if(!$("#conceptoFugaQueja").val() || $("#conceptoFugaQueja").val() == "0") {
            aux += "<li>Concepto</li>";
        }
        if(!$("#prioridadFugaQueja").val()) {
            aux += "<li>Prioridad</li>";
        }
        if(!$("#articuloFugaQueja").val()) {
            aux += "<li>Artículo</li>";
        }
        if(!$("#fechaVisitaFugaQueja").val()) {
            aux += "<li>Fecha visita</li>";
        }
        if(!$("#horarioPreferidoFugaQueja").val()) {
            aux += "<li>Horario preferido</li>";
        }
        if(!$("#asignarTecnicoFugaQueja").val() || $("#asignarTecnicoFugaQueja").val() == "0") {
            aux += "<li>Asignar técnico</li>";
        }
        aux += "</ul>";
        infoMsg('warning', 'Campos requeridos:', aux);
        return;
    } else if(caso.tipo_servicio == "2" && !(
        $("#conceptoQueja").val() && $("#conceptoQueja").val() != "0" &&
        $("#responsableQueja").val() && $("#asigresponsableQuejanarTecnicoFugaQueja").val() != "0" &&
        $("#prioridadQueja").val()
    )) {
        let aux = "<ul>";
        if(!$("#conceptoQueja").val()) {
            aux += "<li>Concepto</li>";
        }
        if(!$("#responsableQueja").val()) {
            aux += "<li>Responsable</li>";
        }
        if(!$("#prioridadQueja").val()) {
            aux += "<li>Prioridad</li>";
        }
        aux += "</ul>";
        infoMsg('warning', 'Campos requeridos:', aux);
        return;
    }
    confirmMsg("warning", "¿Seguro que desea editar el caso?", function(resp) {
        if(resp) {
            let dataSend = [];
            if(caso.tipo_servicio == "1") {
                dataSend.push({
                    'id': caso.internalId,
                    "id_oportuniti" : $('#asociarServicioFugaQueja').val() && $("#asociarServicioFugaQueja").val() != "0" ? $('#asociarServicioFugaQueja').val() : 0,
                    "related_record" : $('#asociarServicioFugaQueja').val() && $("#asociarServicioFugaQueja").val() != "0" ? true : false,
                    "case_id": $("#asociarCasoFugaQueja").val() && $("#asociarCasoFugaQueja").val() != "0" ? $("#asociarCasoFugaQueja").val() : 0,
                    //domicilio
                    "custevent_ptg_conceptos_casos" : $('#conceptoFugaQueja').val(),
                    "priority" : $('#prioridadFugaQueja').val(),
                    "item": $('#articuloFugaQueja').val(),
                    "capEstacionario" : $('#articuloFugaQueja').val() == "4088" ? ($("#capacidadFugaQueja").val().trim() ? $("#capacidadFugaQueja").val().trim() : "") : "",
                    "yearProduct" : $("#anioFugaQueja").val().trim() ? $("#anioFugaQueja").val().trim() : "",
                    "custevent_ptg_fecha_visita" : $('#fechaVisitaFugaQueja').val() ? dateFormatFromDate($('#fechaVisitaFugaQueja').val(), '5') : null,   
                    "custevent_ptg_horario_preferido" : $('#horarioPreferidoFugaQueja').val() ? formatTime($('#horarioPreferidoFugaQueja').val()) : null,
                    "assigned": $("#asignarTecnicoFugaQueja").val() && $("#asignarTecnicoFugaQueja").val() != "0" ? $("#asignarTecnicoFugaQueja").val() : null
                });
            } else {
                dataSend.push({
                    'id': caso.internalId,
                    "id_oportuniti" : $('#asociarServicioQueja').val() && $("#asociarServicioQueja").val() != "0" ? $('#asociarServicioQueja').val() : 0,
                    "related_record" : $('#asociarServicioQueja').val() && $("#asociarServicioQueja").val() != "0" ? true : false,
                    "case_id": $("#asociarCasoQueja").val() && $("#asociarCasoQueja").val() != "0" ? $("#asociarCasoQueja").val() : 0,
                    "custevent_ptg_conceptos_casos" : $('#conceptoQueja').val(),
                    "priority" : $('#prioridadQueja').val(),
                    "status": $("#estadoQueja").val(),
                    "assigned": $("#responsableQueja").val() && $("#responsableQueja").val() != "0" ? $("#responsableQueja").val() : null
                });
            }
            loadMsg();
            let settings = {
                url      : urlPutCases,
                method   : 'PUT',
                data: JSON.stringify({casosUpdate : dataSend})
            }

            setAjax(settings).then((response) => {
                if(response.success) {
                    let notas = [];
                    if(caso.tipo_servicio == "1") {
                        for (let index = 0; index < $("#notasAdicionales tbody").children("tr").length; index++) {
                            const element = $("#notasAdicionales tbody").children("tr")[index];
                            if($(element).find("i").length) {
                                notas.push({ 
                                    type: "nota", 
                                    idRelacionado: caso.internalId, 
                                    titulo: "Nota - Monitor", 
                                    nota: $(element).find("td").first().html().trim(),
                                    transaccion: "caso"
                                });
                            }
                        }
                    } else {
                        for (let index = 0; index < $("#notasAdicionalesQueja tbody").children("tr").length; index++) {
                            const element = $("#notasAdicionalesQueja tbody").children("tr")[index];
                            if($(element).find("i").length) {
                                notas.push({ 
                                    type: "nota", 
                                    idRelacionado: caso.internalId, 
                                    titulo: "Nota - Monitor", 
                                    nota: $(element).find("td").first().html().trim(),
                                    transaccion: "caso"
                                });
                            }
                        }
                    }
                    if(notas.length > 0) {
                        let settings2 = {
                            url      : urlPostNoteandMessage,
                            method   : 'POST',
                            data: JSON.stringify({ informacion: notas })
                        }
                        setAjax(settings2).then((response) => {
                            if(response.success) {
                                swal.close();
                                infoMsg('success', '', "Caso guardado de manera correcta", null, function(resp) {
                                    $(".btn-expand").trigger("click");
                                    getServicios();
                                });                                    
                            }
                        }).catch((error) => {
                            infoMsg('error', 'Error:', "Ocurrio un error al tratar de guardar especificaciones o notas del caso");
                            swal.close();
                        });
                    } else {
                        swal.close();
                        infoMsg('success', '', "Caso guardado de manera correcta", null, function(resp) {
                            $(".btn-expand").trigger("click");
                            getServicios();
                        });                         
                    }
                } else {
                    swal.close();
                    infoMsg('error', 'Error:', "Ocurrio un error al tratar de editar el caso");
                }            
            }).catch((error) => {
                console.log(error);
                infoMsg('error', 'Error:', "Ocurrio un error al tratar de editar el caso");
                swal.close();
            });
        }
    });
    
});

function seguimientoPedido($this) {
    let pedido = $($this).closest("tr").data("item");
    $("#seguimientoPedido").html(pedido.no_pedido ? pedido.no_pedido : '');
    $("#seguimientoModal").modal("show");
}

function asignarViaje($this) {
    let pedido = $($this).closest("tr").data("item");
    console.log(pedido);
    $("#asignarViajePedido").html(pedido.no_pedido ? pedido.no_pedido : '');
    
    $('#asignarViajeRuta').val(pedido.id_no_viaje).trigger("change");
    $("#asignarViajeModal").data("item", pedido);
    $("#asignarViajeModal").modal("show");
}

function cancelarPedido($this) {
    let pedido = $($this).closest("tr").data("item");
    $("#cancelarOppPedido").html(pedido.no_pedido ? " - " + pedido.no_pedido : '');
    $('#cancelarOppMotivo').val(null);
    $('#cancelarOppMotivo').select2({
        selectOnClose: true,
        placeholder: "Seleccione un motivo",
        dropdownParent: $('#cancelarOppModal'),
        language: {
            "noResults": function(){
                return "Sin resultados encontrados";
            }
        }
    });
    $('#cancelarOppObservaciones').val(null);
    $("#cancelarOppModal").data("item", pedido);
    $("#cancelarOppModal").modal("show");
}


$("#guardarCancelarOpp").click(function() {
    let pedido = $("#cancelarOppModal").data("item");
    if($("#cancelarOppObservaciones").val().trim() && $("#cancelarOppMotivo").val()) {
        let statusID = "";
        vrStatus.forEach(element => {
            if(element.nombre.toLowerCase().trim() == "cancelado") {
                statusID = element.id;
            }
        });
        let dataSend = {
            "opportunitiesUpdate": [
                {
                    "id": pedido.no_pedido,
                    "bodyFields": {
                        "custbody_ptg_estado_pedido": statusID,
                        "custbody_ptg_motivo_cancelation" : $("#cancelarOppMotivo").val()
                    },
                    "lines": [
                        
                    ]
                }
            ]
        };
        loadMsg();
        let settings = {
            url      : urPutOppMonitor,
            method   : 'PUT',
            data: JSON.stringify(dataSend)
        }
        setAjax(settings).then((response) => {
            if(response.success) {
                let nota = [{ 
                    type: "nota", 
                    idRelacionado: pedido.no_pedido, 
                    titulo: "Cancelación de servicio", 
                    nota: $("#cancelarOppObservaciones").val().trim(),
                    transaccion: "oportunidad"
                }];
                let settings2 = {
                    url      : urlPostNoteandMessage,
                    method   : 'POST',
                    data: JSON.stringify({ informacion: nota })
                }
                setAjax(settings2).then((response) => {
                    if(response.success) {
                        $("#cancelarOppModal").modal("hide");
                        swal.close();
                        infoMsg('success', '', "Servicio cancelado de manera correcta", null, function(resp) {
                            getServicios();
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                    swal.close();
                });
            } else {
                swal.close();
                infoMsg('error', 'Error:', "Ocurrio un error al tratar de cancelar el servicio");
            }            
        }).catch((error) => {
            console.log(error);
            swal.close();
        });
    } else {
        let aux = "<ul>";
        if(!$("#cancelarOppMotivo").val()) {
            aux += "<li>Motivo de Cancelacion</li>";
        }
        if(!$("#cancelarOppObservaciones").val().trim()) {
            aux += "<li>Observaciones</li>";
        }
        aux += "</ul>";
        infoMsg('warning', 'Campos requeridos:', aux);
    }
});

$("#guardarAsignarViaje").click(function() {
    let pedido = $("#asignarViajeModal").data("item");
    if($("#asignarViajeRuta").val() && $("#asignarViajeRuta").val().trim()) {
        let dataSend = {
            "opportunitiesUpdate": [
                {
                    "id": pedido.no_pedido,
                    "bodyFields": {
                        "custbody_ptg_numero_viaje": $("#asignarViajeRuta").val()
                    },
                    "lines": [
                        
                    ]
                }
            ]
        };
        loadMsg();
        let settings = {
            url      : urPutOppMonitor,
            method   : 'PUT',
            data: JSON.stringify(dataSend)
        }
        setAjax(settings).then((response) => {
            if(response.success) {
                $("#asignarViajeModal").modal("hide");
                swal.close();
                infoMsg('success', '', "Viaje asinado de manera correcta", null, function(resp) {
                    getServicios();
                });
            } else {
                swal.close();
                infoMsg('error', 'Error:', "Ocurrio un error al tratar de asinar el viaje al servicio");
            }            
        }).catch((error) => {
            console.log(error);
            infoMsg('error', 'Error:', "Ocurrio un error al tratar de asinar el viaje al servicio");
            swal.close();
        });
    } else {
        let aux = "<ul>";
        if(!$("#asignarViajeRuta").val() || !$("#asignarViajeRuta").val().trim()) {
            aux += "<li>Viaje</li>";
        }
        aux += "</ul>";
        infoMsg('warning', 'Campos requeridos:', aux);
    }
});

function verDetalles($this) {
    let pedido = $($this).closest("tr").data("item");
    console.log(pedido);
    $("#verDetallesCliente").html(pedido.id_cliente + " - " + pedido.nombre_cliente);
    $("#verDetallesTelefono").html(pedido.telefono.trim());
    $("#verDetallesDireccion").html(pedido.direccion.trim());
    $("#verDetallesTipoServicio").html(pedido.tipo_cliente.trim());

    $("#verDetallesServicio").html(pedido.no_pedido);
    $("#verDetallesVehiculo").html(pedido.nombre_vehiculo.trim() ? pedido.nombre_vehiculo.trim() : 'Sin asignar');
    $("#verDetallesZona").html(pedido.zona);
    $("#verDetallesUsuarioMonitor").html(pedido.usuario_monitor.trim() ? pedido.usuario_monitor.trim() : 'Sin asignar');
    $("#verDetallesDireccion2").html(pedido.direccion);
    $("#verDetallesFechaPrometida").html(dateFormatFromDate(pedido.fecha_prometida, '5'));
    $("#verDetallesFechaPedido").html(dateFormatFromDate(pedido.fecha_solicitud, '5'));
    $("#verDetallesFechaNotificacion").html(pedido.fecha_notificacion ? dateFormatFromDate(pedido.fecha_notificacion, '5') + " - " + pedido.hora_notificacion : 'Sin asignar');
    $("#verDetallesTipoProducto").html("");
    vrTiposServicios.forEach(element => {
        if(pedido.servicio == element.id) {
            $("#verDetallesTipoProducto").html(element.nombre);
        }
    });
    if($("#verDetallesTipoProducto").html().trim() == "") {
        $("#verDetallesTipoProducto").html("Desconocido");
    }
    $("#verDetallesContrato").html(pedido.contrato ? pedido.contrato : 'Sin contrato');
    $("#verDetallesAgenteAtiende").html(pedido.usuario_pedido_solicitud);
    $("#verDetallesTiempoNotificacion").html(pedido.fecha_hora_notificacion ? getRestTime(dateFormatFromString(pedido.fecha_notificacion+(pedido.hora_notificacion ? " "+pedido.hora_notificacion : ''), "1")) : 'Sin asignar');
    $("#verDetallesObservaciones").html(pedido.observaciones ? pedido.observaciones : 'Sin observaciones');
    $("#formVerDetallesPedidos").modal("show");
}

countServices = 0;

function orderOrders(data) {
    let segundaLlamada = [],
        sinNotificar = [],
        auxPedidos = [],
        sinNotificarI = [],
        sinNotificarC = [],
        sinNotificarD = [],
        sinNotificarA = [],
        notificados = [],
        cancelados = [],
        entregados = [],
        faltantes = [];
    data.forEach(element => {
      if(element.segunda_llamada && (element.status_id == '1' || element.status_id == '2')) {
        if(element.status_id == '1') {
          element.status_color = '#000';
          element.outline = true;
        }
        segundaLlamada.push(element);
      } else if(element.status_id == '1') {
        element.status_color = '#000';
        sinNotificar.push(element);
      } else if(element.status_id == '2') {
        notificados.push(element);
      } else if(element.status_id == '5') {
        cancelados.push(element);
      } else if(element.status_id == '3') {
        entregados.push(element);
      } else {
        faltantes.push(element);
      }
    });

    sinNotificar.forEach(element => {
      if(element.tipo_cliente.trim().toLowerCase() == 'doméstico') {
        sinNotificarD.push(element);
      } else if(element.tipo_cliente.trim().toLowerCase() == 'comercial') {
        sinNotificarC.push(element);
      } else if(element.tipo_cliente.trim().toLowerCase() == 'industrial') {
        sinNotificarI.push(element);
      } else {
        sinNotificarA.push(element);
      }
    });

    notificados.forEach(element => {
      if(element.fecha_hora_notificacion && element.fecha_hora_notificacion <= new Date()) {
        if(getRestTime(element.fecha_hora_notificacion, "2") >= 2) {
          element.status_color = "#f68f1e";
        } else {
          element.status_color = "#9a9a9a";
        }
      }
    });

    /* Segunda llamada: En orden de notificación del más antiguo al más reciente */
    segundaLlamada.forEach(element => {
      auxPedidos.push(element);
    });

    /* Sin notificar (Color blanco): del más antiguo al más reciente y por
    tipo de cliente:
    1. Industrial
    2. Comercial
    3. Domestico*/
    sinNotificarI.forEach(element => {
      auxPedidos.push(element);
    });
    sinNotificarC.forEach(element => {
      auxPedidos.push(element);
    });
    sinNotificarD.forEach(element => {
      auxPedidos.push(element);
    });
    sinNotificarA.forEach(element => {
      auxPedidos.push(element);
    });

    /* Notificados */
    notificados.forEach(element => {
      auxPedidos.push(element);
    });

    /* Cancelados */
    cancelados.forEach(element => {
      auxPedidos.push(element);
    });

    /* Prestados (entregados) */
    entregados.forEach(element => {
      auxPedidos.push(element);
    });

    /* otros */
    faltantes.forEach(element => {
      auxPedidos.push(element);
    });

    return auxPedidos;
}

function readyInit() {
    let totalServices = 8;
    countServices += 1;
    if(countServices == totalServices) {
        getServicios();
    }
}

// Pobla los selects dinámicos de los formularios
loadMsg();
getPlantas();
getStatusOportunidad();
getTiposServicios();
getListCancellReason();
getConceptosCasos();
getArticulos();
getListSuppEmp();
getMethodPayments();