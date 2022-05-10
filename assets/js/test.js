$(function() {
    $('.select-search-customer').select2({
        ajax: {
            url: urlGetSelectCustomer,
            delay: 450,
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: function (params) {
                let queryParameters = {
                    filtro: params.term,
                    idPlanta : $('select#plantas').val(),
                }

                return JSON.stringify(queryParameters);
            },
            processResults: function (response) {
                if(response.data.length > 0) {
                    response.data.forEach(element => {
                        element.text = element.nombre + " - " + getDireccionFormat(element, "cliente") + " - " + element.telefono;
                    });
                }
                return {                     
                    results: $.map(response.data, function(obj) {
                        return { id: obj.id, text: obj.text, idAdress: obj.idAdress };
                    })
                };
            },
        },
        placeholder: 'Buscar por nombre, id, teléfono...',
        language: "es"
    });
});

function getDireccionFormat(item, tipo) { 
    let auxDir = "";
    if(tipo == "pedido") {
        auxDir += (item.street && item.street.trim() ? item.street.trim() : '');
        auxDir += (item.nExterior && item.nExterior.trim() ? (auxDir ? ' #' : '#') + item.nExterior.trim() : '');
        auxDir += (item.nInterior && item.nInterior.trim() ? (auxDir ? ' Int. ' : 'Int. ') + item.nInterior.trim() : '');
        auxDir += (item.colonia && item.colonia.trim() ? (auxDir ? ', ' : '') + capitalizeFirstsLetter(item.colonia.trim()) : '');
        auxDir += (item.cp && item.cp.trim() ? (auxDir ? ', ' : '') + item.cp.trim() : '');
        auxDir += (item.municipio && item.municipio.trim() ? (auxDir ? ' ' : '') + capitalizeFirstsLetter(item.municipio.trim()) : '');
        auxDir += (item.estadoDireccion && item.estadoDireccion.trim() ? (auxDir ? ', ' : '') + capitalizeFirstsLetter(item.estadoDireccion.trim()) : '');
    } else if(tipo == "caso") {
        auxDir += (item.calleDireccion && item.calleDireccion.trim() ? item.calleDireccion.trim() : '');
        auxDir += (item.nExterior && item.nExterior.trim() ? (auxDir ? ' #' : '#') + item.nExterior.trim() : '');
        auxDir += (item.nInterior && item.nInterior.trim() ? (auxDir ? ' Int. ' : 'Int. ') + item.nInterior.trim() : '');
        auxDir += (item.colonia && item.colonia.trim() ? (auxDir ? ', ' : '') + capitalizeFirstsLetter(item.colonia.trim()) : '');
        auxDir += (item.cp && item.cp.trim() ? (auxDir ? ', ' : '') + item.cp.trim() : '');
        auxDir += (item.municipio && item.municipio.trim() ? (auxDir ? ' ' : '') + capitalizeFirstsLetter(item.municipio.trim()) : '');
        auxDir += (item.estadoDireccion && item.estadoDireccion.trim() ? (auxDir ? ', ' : '') + capitalizeFirstsLetter(item.estadoDireccion.trim()) : '');
    } else if(tipo == "cliente") {
        auxDir += (item.calle && item.calle.trim() ? item.calle.trim() : '');
        auxDir += (item.nExterior && item.nExterior.trim() ? (auxDir ? ' #' : '#') + item.nExterior.trim() : '');
        auxDir += (item.nInterior && item.nInterior.trim() ? (auxDir ? ' Int. ' : 'Int. ') + item.nInterior.trim() : '');
        auxDir += (item.colonia && item.colonia.trim() ? (auxDir ? ', ' : '') + capitalizeFirstsLetter(item.colonia.trim()) : '');
        auxDir += (item.cp && item.cp.trim() ? (auxDir ? ', C.P. ' : '') + item.cp.trim() : '');
        auxDir += (item.entre1 && item.entre1.trim() ? (auxDir ? ', Entre ' : '') + capitalizeFirstsLetter(item.entre1.trim()) : '');
        auxDir += (item.entre2 && item.entre2.trim() ? (auxDir ? ' y ' : '') + capitalizeFirstsLetter(item.entre2.trim()) : '');
    }
    return auxDir.trim();
}

function capitalizeFirstsLetter(string) {
    let auxStr = "";
    string.split(" ").forEach(element => {
        if(auxStr != "") {
            auxStr += " ";
        }
        auxStr += element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
    });
    return auxStr.trim();
}

// Se podrá solicitar la información de un cliente al seleccionar una opción del listado de resultados
$('.select-search-customer').on("select2:select", function (e) { 
    let clienteId = $(this).val();
    let tieneProductos = $('#sinProductos').hasClass('d-none');
    if ( tieneProductos ) {// Tiene productos agregados
        swal({
            title: 'Tiene un pedido en curso, ¿Está seguro de continuar con la búsqueda de un cliente nuevo?',
            icon: 'warning',
            buttons:{
                cancel: {
                  text: "Cancelar",
                  value: null,
                  visible: true,
                  className: "btn-danger-cc",
                  closeModal: true,
                },
                confirm: {
                  text: "Aceptar",
                  value: true,
                  visible: true,
                  className: "btn-primary-cc",
                  closeModal: true
                }
            },
            dangerMode: true,
            cancelButtonColor: "btn-light" 
        }).then((accept) => {
            if ( accept ) {
                searchCustomer( clienteId, e.params.data.idAdress );
            }
        }).catch(swal.noop);
    } else {
        searchCustomer( clienteId, e.params.data.idAdress );
    }
    $('select.select-search-customer').val(null).trigger("change");
});

// Se inyecta la información del usuario logueado
$('span.user-name').text(userName);
$('span#role').text(userRole);

// Si el rol es distinto a administrador HEB, se eliminan los campos
if ( userRole != 'administrator' ) {
    console.log(userRole);
    $('.campos-contrato').addClass('d-none');
    // $('.campos-contrato').remove();
} else {
    console.log(userRole);
    $('.campos-contrato').removeClass('d-none');
}

// Función para filtrar clientes por un texto
function searchCustomer(clienteId, idAddress = null) {
    loadMsg('Espere un momento...');

    clearCustomerInfo();

    let dataSearchCustomer = {
        "internalId" : clienteId,
        // "planta"     : $("select#plantas").val(),
    };

    let settings = {
        url    : urlObtenerClientePorId,
        method : 'POST',
        data   : JSON.stringify(dataSearchCustomer),
    }

    setAjax(settings).then((response) => {
        swal.close();
        // console.log('Cliente encontrado', response);
        customerGlobal = response.data[0];
        setCustomerInfo(response.data[0], idAddress);
        $('#filtrarHistorico, #editarCliente, #agregarDireccion, #editarDireccion, #guardarPedido, #agregarProducto, #agregarMetodoPago, #guardarFugaQueja').attr('disabled', false);
    }).catch((error) => {
        infoMsg('error', 'Cliente no encontrado', 'Verifique que la información sea correcta');
        // Limpia los campos de cliente
        clearCustomerInfo();
        console.log(error);
    });
}

// Función para enviar la información del cliente al frontend
function setCustomerInfo(customer, idAddress = null) {
    let direcciones = customer.addr;
    let zonaVenta = direccionDefault = null;
    
    $('.badgesClientes').addClass('d-none');
    $('#badgeDescuento').children('span.badge').removeClass('bg-danger-cc, bg-success-cc'); // Se le quita la clase success o danger
    
    $('#idCliente').text(customer.id);
    $('#nombreCliente').text(customer.nombreCompleto);
    $('#telefonoCliente').text(customer.telefono);
    $('#giroCliente').text(customer.giroCustomer ? customer.giroCustomer : 'Sin giro');
    $('#contratoCliente').text(customer.contrato ? customer.contrato : 'Pendiente de validar');
    $('#notasCliente').text(customer.notasCustomer ? customer.notasCustomer : 'Sin notas');
    $('#tipoCliente').text(customer.typeCustomer);
    // Campos del formulario quejas y fugas
    $('#emailFugaQueja').val(customer.email);
    $('#telefonoFugaQueja').val(customer.telefono);

    if ( customer.statusCostumer == 'Activo') { $('#badgeActivo').removeClass('d-none'); }
    else if ( customer.statusCostumer == 'Inactivo') { $('#badgeInactivo').removeClass('d-none');  }
    
    // Muestra el badge de descuento
    if ( customer.descuento ) {
        let tipoDescuento = null;
        let saldoVencido = parseFloat(customer.saldoVencido).toFixed(2);
        $('#badgeDescuento').removeClass('d-none');
        if ( saldoVencido > 0 ) {
            $('#badgeDescuento').children('span.badge').addClass('bg-danger-cc');
        } else {
            $('#badgeDescuento').children('span.badge').addClass('bg-success-cc');
        }
        
        if ( customer.tipoDescuento == "1" ) {// Porcentaje
            tipoDescuento = 'Porcentaje';
        } else if ( customer.tipoDescuento == "2" ) {// Peso
            tipoDescuento = 'Pesos';
        }

        $('.descuento-tipo').children('td').siblings("td:nth-child(2)").text(tipoDescuento ? tipoDescuento : 'Sin asignar');
        $('.descuento-cantidad').children('td').siblings("td:nth-child(2)").text(customer.descuento ? customer.descuento : 'Sin asignar');
    }

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
                    '<option '+((!idAddress && direcciones[key].defaultShipping) || (idAddress == direcciones[key].idAddressLine) ? 'selected' : '')+' data-address='+"'"+JSON.stringify(direcciones[key])+"'"+' value="'+direcciones[key].idAddressLine+'">'+textoDireccion+'</option>'
                );
            }
        }
    }
    if ( direccionDefault?.typeService ) {
        $('#direccionCliente').prop('title', setDir( direccionDefault ));// Activa el tooltip de la dirección
        $('#tipoServicioCliente').text(direccionDefault.typeService);
        setTextRoutesByAddress(direccionDefault);

        // let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="tooltip"]'))
        // let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        //     return new bootstrap.Tooltip(tooltipTriggerEl);
        // });
    }

    // Obtiene los casos y oportunidades del cliente
    getCasosOportunidades();

    // Se obtienen los datos de la colonia
    setColoniaZonaData(direccionDefault);

    // Setea la información del modal
    setAlianzaComercial(customer);

    // Muestra los casos pendientes si es que existen
    getPendingCases();

    // Muestra la lista de créditos del cliente
    getListCreditCustomer();

    // Muestra la lista de créditos por aprobar, sólo debe ser visible por el usuario con rol supervisor
    getListRmaCustomer();
}

// Setea los datos dependiendo del tipo de alianza del cliente: contrato, crédito o contado
function setAlianzaComercial(customer) {
    let tipoAlianza = customer.alianzaComercial.toUpperCase();
    let infoComercial = customer.objInfoComercial;
    $('option.opt-method-credito-cliente').addClass('d-none');
    $('#badgeAlianza').children('span').removeClass('bg-danger-cc bg-success-cc');
    $('tr.alianza').addClass('d-none');

    // Valida el color que debe mostrar la alianza comercial
    if ( infoComercial.diasAtraso ) {
        console.log('tiene el objeto dias atraso');
        if ( parseInt(infoComercial.diasAtraso) > 0 ) {
            $('#badgeAlianza').children('span').addClass('bg-danger-cc');
        } else {
            $('#badgeAlianza').children('span').addClass('bg-success-cc');
        }
    }
    if ( tipoAlianza ==  'CONTRATO' ) {
        $('option.opt-method-credito-cliente').removeClass('d-none');
        $('#badgeAlianza').removeClass('d-none');
        $('#badgeAlianza').children('span').text('Contrato');
        $('.alianza-no-contrato, .alianza-fecha-inicio, .alianza-limite-credito, .alianza-dias-credito, .alianza-saldo-disponible, .alianza-dias-vencidos, .alianza-monto-adeudo').removeClass('d-none')
        $('.alianza-fecha-alta').children('td').siblings("td:nth-child(2)").text(infoComercial.fechaAlta ? infoComercial.fechaAlta : 'Sin asignar');
        $('.alianza-no-contrato').children('td').siblings("td:nth-child(2)").text(infoComercial.contrato ? infoComercial.contrato : 'Sin asignar');
        $('.alianza-fecha-inicio').children('td').siblings("td:nth-child(2)").text(customer.fechaContrato ? customer.fechaContrato : 'Sin asignar');
        $('.alianza-limite-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.limiteCredito ? infoComercial.limiteCredito : 'Sin asignar');
        $('.alianza-dias-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.terms ? infoComercial.terms : 'Sin asignar');
        $('.alianza-saldo-disponible').children('td').siblings("td:nth-child(2)").text(infoComercial.saldoDisponible ? infoComercial.saldoDisponible : 'Sin asignar');
        $('.alianza-dias-vencidos').children('td').siblings("td:nth-child(2)").text(infoComercial.diasAtraso ? infoComercial.diasAtraso : 'Sin asignar');
        $('.alianza-monto-adeudo').children('td').siblings("td:nth-child(2)").text(infoComercial.creditoUtilizado ? infoComercial.creditoUtilizado : 'Sin asignar');
    } else if ( tipoAlianza ==  'CREDITO' ) {
        $('option.opt-method-credito-cliente').removeClass('d-none');
        $('#badgeAlianza').children('span').text('Crédito');
        $('#badgeAlianza').removeClass('d-none');
        $('.alianza-fecha-inicio, .alianza-limite-credito, .alianza-dias-credito, .alianza-saldo-disponible, .alianza-dias-vencidos, .alianza-monto-adeudo').removeClass('d-none')
        $('.alianza-fecha-alta').children('td').siblings("td:nth-child(2)").text(infoComercial.fechaAlta ? infoComercial.fechaAlta : 'Sin asignar');
        $('.alianza-fecha-inicio').children('td').siblings("td:nth-child(2)").text(customer.fechaContrato ? customer.fechaContrato : 'Sin asignar');
        $('.alianza-limite-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.limiteCredito ? infoComercial.limiteCredito : 'Sin asignar');
        $('.alianza-dias-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.terms ? infoComercial.terms : 'Sin asignar');
        $('.alianza-saldo-disponible').children('td').siblings("td:nth-child(2)").text(infoComercial.saldoDisponible ? infoComercial.saldoDisponible : 'Sin asignar');
        $('.alianza-dias-vencidos').children('td').siblings("td:nth-child(2)").text(infoComercial.diasAtraso ? infoComercial.diasAtraso : 'Sin asignar');
        $('.alianza-monto-adeudo').children('td').siblings("td:nth-child(2)").text(infoComercial.creditoUtilizado ? infoComercial.creditoUtilizado : 'Sin asignar');
    }
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
    console.log(zonaRuta);
    $('#zonaVentaCliente').text(zonaRuta.zona_venta);
    $('#zonaPrecioCliente').text(zonaRuta.territorio).data("price", zonaRuta.precio);
    $('#rutaCliente').text(splitRuta[1] ?? "Sin ruta");
    $('#zonaVentaPedido').val(zonaRuta?.zona_venta);
    $('#tipoServicioCliente').text(direccion.typeService ? direccion.typeService : 'Sin tipo de servicio');
    if ( desde ) {// Si la dirección es de aviso o programado, se setea el campo desde de manera automática
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
    } else {// Se setea por default la hora actual en el campo desde
        let horaDefault = moment().format('HH:mm');
        $('#desdePedido').val(horaDefault);
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
    direccion.numExterno      ? str+= ' #'+direccion.numExterno : '';
    direccion.numInterno      ? str+= ' #'+direccion.numInterno : '';
    direccion.entreCalle      ? str+= ' Entre '+direccion.entreCalle : '';
    direccion.entreYCalle     ? str+= ' Y '+direccion.entreYCalle : '';
    direccion.colonia         ? str+= ', Col. '+direccion.colonia : '';
    direccion.zip             ? str+= ', C.P. '+direccion.zip : '';
    direccion.stateName       ? str+= ', '+direccion.stateName : '';
    direccion.city            ? str+= ', '+direccion.city : '';
    direccion.defaultBilling  ? str+= ', Facturación' : '';

    return str;
}

// Función para obtener la lista de estatus de las oportunidades
function getListaStatusOpp() {
    let settings = {
        url      : urlGetEstadosOpp,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        estadosOppArr = response.data;
        setSelectEstatusOpp(estadosOppArr);
    }).catch((error) => {
        console.log(error);
    });
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

// Función para obtener la lista de cuentas disponibles para los prepagos
function getListaCuentas(metodoId) {
    let params = {
        // "subsidiary"    : userSubsidiary,
        "subsidiary"    : 25,
        "methodPayment" : metodoId
    }
    let settings = {
        url      : urlGetAccountsPrepayment,
        method   : 'POST',
        data     : JSON.stringify(params)
    }

    setAjax(settings).then((response) => {
        setSelectListaCuenta((response.data));
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

// Obtiene la lista de cancelación
function getListaCancelacion() {
    let settings = {
        url    : urlGetListaCancelacion,
        method : 'GET',
    }

    setAjax(settings).then((response) => {
        setSelectCancelacion((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Pobla los selects dinámicos de los formularios
getPlantas();
getArticulos();
getMetodosPago();
getBusinessType();
getServiceOrigin();
getListaStatusOpp();
getListaCancelacion();

// Método para llenar el select de plantas
function setSelectPlants(items) {
    if ( items.length ) {
        $('select#plantas').children('option').remove();
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#plantas").append(
                    '<option data-pedido-minimo="'+parseFloat(items[key].min).toFixed(2)+'" value='+items[key].id+'>'+items[key].nombre+'</option>'
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
        articulosArr = items;
        $('select#articuloFrecuenteCilFormCliente, select#articuloFrecuenteEstFormCliente, select#capacidadFormProductos, select#articuloFugaQueja').children('option').remove();
        $('select#articuloFugaQueja').append('<option value="">Seleccione una opción</option>')
        // $('select#articuloFrecuenteEstFormCliente').children('option').remove();
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                let articulo = '<option value='+items[key].id+' data-articulo=' + "'" + JSON.stringify(items[key]) + "'" + '>'+items[key].nombre+'</option>';
                if ( items[key].tipo_articulo == 1 ) {// Cilindro
                    $("select#articuloFrecuenteCilFormCliente, select#capacidadFormProductos").append( articulo );
                } else if ( items[key].tipo_articulo == 2 ) {// Estacionario
                    $("select#articuloFrecuenteEstFormCliente").append( articulo );
                }

                if ( [1,2].includes(Number(items[key].tipo_articulo)) ) {
                    $("select#articuloFugaQueja, select#filtroTipoProductoCaso").append( articulo );
                }
            }
        }
    } else {
        articulosArr = [];
        console.warn('No hay artículos por cargar');
    }
}

// Método para llenar el select de método de pago
function setSelectMetodosPago(items) {
    $('select#metodoPagoPedido').children('option').remove();
    if ( items.length ) {
        metodosPago = items;
        $("select#metodoPagoPedido").append('<option value="0">Seleccione una opción</option>')
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                let metodo = items[key];
                let metodoId = parseInt(metodo.id);
                let classMethod = '';

                if ( metodoId == metodoCredito ) { classMethod = 'opt-method-credito-cliente d-none'; } // Es método crédito de cliente
                else { classMethod = 'opt-method-normal'; } // Es método de pago normal

                if ( metodoId != metodoMultiple ) {// Si es diferente a método de pago múltiple, se añade al select
                    $("select#metodoPagoPedido").append(
                        '<option class="'+classMethod+'" value='+metodo.id+'>'+metodo.method+'</option>'
                    );
                }
            }
        }
    } else {
        console.warn('No hay métodos de pago por cargar');
    }
}

// Método para llenar el select de la lista de cuentas acorde al prepago seleccionado
function setSelectListaCuenta(items) {
    $('select#tipoCuenta').children('option').remove();
    if ( items.length ) {
        $("select#tipoCuenta").append('<option value="0">Seleccione una opción</option>')
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                let cuenta = items[key];

                $("select#tipoCuenta").append(
                    '<option value='+cuenta.accountId+'>'+cuenta.account+'</option>'
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

// Método para llenar el select de los estatus de la oportunidad
function setSelectEstatusOpp(items) {
    if ( items.length ) {
        $('select#estadoSolicitudFiltro').children('option').remove();
        $("select#estadoSolicitudFiltro").append('<option value="">Seleccione una opción</option>');

        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#estadoSolicitudFiltro").append(
                    '<option value='+items[key].id+'>'+items[key].nombre+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay plantas por cargar');
    }
}


// Método para llenar el select de motivos de cancelación para un caso u oportunidad
function setSelectCancelacion(items) {
    $('select#cancelarOppMotivo').children('option').remove();
    if ( items.length ) {
        $("select#cancelarOppMotivo").append('<option value="">Seleccione una opción</option>')
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                $("select#cancelarOppMotivo").append(
                    '<option value='+items[key].id+'>'+items[key].name+'</option>'
                );
            }
        }
    } else {
        console.warn('No hay registros por cargar');
    }
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
 
    $('select#asociarServicioFugaQueja, select#asociarCasoFugaQueja').children('option').remove();
    $('select#asociarServicioFugaQueja, select#asociarCasoFugaQueja').append('<option value="">Seleccione una opción</option>');

    setAjax(settings).then((response) => {
        // console.log('pedidos obtenidos exitósamente', response);
        setCasosOportunidades(JSON.parse(response.data));
    }).catch((error) => {
        console.log('Error en la consulta', error);
    });
}

// Valida el contenido de casos y oportunidades y llama la función setTrOppCases
function setCasosOportunidades( data ) {
    $('div#historic-data').fadeOut();
    let casos         = data.casos;
    let oportunidades = data.oportunidades;
    let pendientes    = [];
    let totalRows     = data.casos.length + data.oportunidades.length;
    console.log('Casos', casos);
    console.log('Oportunidades', oportunidades);

    $("div#historic-data table thead tr th").css('z-index', "3");
    $($("div#historic-data table thead tr th")[0]).css('z-index', "4");
    $($("div#historic-data table thead tr th")[1]).css('z-index', "4");
    // $($("div#historic-data table thead tr th")[2]).css('z-index', "4");

    // Checa casos
    if ( casos.length ) {
        // numero de documento, fecha
        for ( var key in casos ) {
            if ( casos.hasOwnProperty( key ) ) {
                $('div#historic-data table.table-gen tbody').append(
                    setTrOppCases( casos[key], 'casos', casos.length, key )
                );

                $('select#asociarCasoFugaQueja').append('<option value="'+casos[key].id_Transaccion+'">No. caso: '+casos[key].numeroCaso+' - Fecha visita: '+casos[key].fecha_visita+'</option>');
            }
        }
    } else {
        // console.warn('No hay casos por cargar');
    }

    // Checa oportunidades
    if ( oportunidades.length ) {
        for ( var key in oportunidades ) {
            if ( oportunidades.hasOwnProperty( key ) ) {
                $('div#historic-data table.table-gen tbody').append(
                    setTrOppCases( oportunidades[key], 'oportunidades', oportunidades.length, key )
                );

                // Hay pendientes
                if ( [2,1,6,4].includes(parseInt(oportunidades[key].estadoId)) ) {
                    pendientes.push(oportunidades[key]);
                }

                $('select#asociarServicioFugaQueja').append('<option value="'+oportunidades[key].id_Transaccion+'"> No. documento: '+oportunidades[key].numeroDocumento+' - Fecha: '+oportunidades[key].fecha+'</option>');

            }
        }
    } else {
        // console.warn('No hay oportunidades por cargar');
    }

    // Enlista el número de documento de la oportunidad
    if ( pendientes.length ) {
        $('#badgePendientes').removeClass('d-none');
        $('table.opp-pendientes').children('tbody').children('tr').remove();

        for (let x = 0; x < pendientes.length; x++) {
            $('table.opp-pendientes tbody').append(
                '<tr>'+
                    '<td class="ion-text-center">'+pendientes[x].fecha+'</td>'+
                    '<td class="ion-text-center">'+pendientes[x].cierrePrevisto+'</td>'+
                    '<td class="ion-text-center">'+pendientes[x].numeroDocumento+'</td>'+
                    '<td class="ion-text-center">'+( pendientes[x].conductorAsignado ? pendientes[x].conductorAsignado : 'Sin asignar' )+'</td>'+
                '</tr>'
            );
        }
    }

    // Vuelve a mostrar la tabla
    $('div#historic-data table').fancyTable({
        sortColumn:3,
        pagination: true,
        perPage: 10,
        searchable:false,
        sortable: true
    });
    if ($(".btn-expand").find("i").hasClass('fa-caret-right')) {
        $("tfoot").addClass("expand");
    } else {
        $("tfoot").removeClass("expand");
    }
    // $('div#historic-data table').DataTable();
    $('div#historic-data').fadeIn('slow');
}

// Método para llenar la tabla de casos y oportunidades
function setTrOppCases(item, type = 'casos', numItems = 1, posicion) {
    // Se necesita modificar el z-index de los th
    let tr = 
    '<tr class='+type+' data-item='+"'"+JSON.stringify(item)+"'"+'>'+
        '<td class="text-center sticky-col">'+  
            '<div class="btn-group dropend vertical-center drop-options-'+item.id_Transaccion+' d-none '+type+'">'+
                '<i class="fa-solid fa-ellipsis-vertical c-pointer dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 24px;"></i>'+
                '<ul class="dropdown-menu">'+
                    '<li onclick="verDetalles(this)" class="'+type+' px-2 py-1 c-pointer" style="font-size: 16px">'+
                        '<i class="fa-solid fa-eye color-primary"></i> Ver detalles'+
                    '</li>'+
                    '<li onclick="cancelarPedido(this)" class="'+type+' px-2 py-1 c-pointer d-none" style="font-size: 16px">'+
                        '<i class="fa-solid fa-circle-xmark text-danger"></i> Cancelar servicio'+
                    '</li>'+
                    '<li onclick="verNotasAdicionales(this)" class="'+type+' px-2 py-1 c-pointer" style="font-size: 16px">'+
                        '<i class="fa-solid fa-list color-primary"></i> Ver comentarios'+
                    '</li>'+
                    '<li onclick="verNotasAgregarDescuento(this)" class="'+(type) +' '+ (type == 'oportunidades' ? '' : 'd-none')+' px-2 py-1 c-pointer" style="font-size: 16px">'+
                        '<i class="fa-solid fa-tag color-primary"></i> Agregar descuento'+
                    '</li>'+
                '</ul>'+
            '</div>'+
        '</td>'+
        '<td style="left: 40px;" class="text-center sticky-col">'+
            '<div class="text-center">'+
                '<input class="form-check-input check-opp-caso '+type+'" type="checkbox" value="" id="'+item.id_Transaccion+'">'+
            '</div>'+
        '</td>'+
        // '<td style="left: 80px;" class="sticky-col"><button class="btn btn-danger"></button></td>'+
        (isAdmin ? '<td>'+( item.id_Transaccion ?? 'Sin ID de servicio')+'</td>' : '')+
        '<td>'+( type == "casos" ? dateFormatFromDate(item.fechaCreacion.split(" ")[0], '5')  : dateFormatFromDate(item.fecha, '5') )+'</td>'+//Fecha creación
        '<td>'+( type == "casos" ? ( 'Sin fecha prometida' ) : (item.cierrePrevisto ?? 'Sin fecha prometida') )+'</td>'+// Fecha prometida
        '<td>'+( type == "casos" ? ( item.articulo ?? 'Sin asignar' ) : ( item.tipoServicio ? item.tipoServicio : 'Sin asignar' ) )+'</td>'+// Tipo servicio
        '<td>'+( type == "casos" ? ( item.numeroCaso ?? 'Sin asignar' ) : ( item.numeroDocumento ?? 'Sin asignar' ) )+'</td>'+// Numero de documento u caso
        '<td>'+( type == "casos" ? ( item.asunto ?? 'Sin asignar' ) : ( 'Pedido' ) )+'</td>'+// Asunto
        // '<td>'+( type == "casos" ? ( item.fecha_visita ? item.fecha_visita : 'Sin asignar' ) : ( 'Sin asignar' ) )+'</td>'+// Fecha visita
        // '<td>'+( type == "casos" ? ( item.hora_visita ?? 'Sin asignar' ) : ( item.horaVisita ?? 'Sin asignar' ) )+'</td>'+// Hora visita
        '<td>'+( type == "casos" ? ( item.estatus ?? 'Sin asignar' ) : ( item.estado ?? 'Sin asignar' ) )+'</td>'+// Estado
        '<td>'+( type == "casos" ? ( item.prioridad ?? 'Sin asignar' ) : 'N/A' )+'</td>'+// Prioridad
    '</tr>';
    // <th class="text-center">ID del servicio</th>
    // <th class="text-center">Fecha creación</th>
    // <th class="text-center">Fecha prometida</th>
    // <th class="text-center">Tipo Servicio</th>
    // <th class="text-center">Número de documento</th>
    // <th class="text-center">Asunto</th>
    // <th class="text-center">Fecha visita</th>
    // <th class="text-center">Hora visita</th>
    // <th class="text-center">Estado</th>
    // <th class="text-center">Prioridad</th>

    return tr;
}

// Método para limpiar la data del cliente cuando falla una búsqueda
function clearCustomerInfo () {
    // Inhabilita el botón de agregar dirección
    $('#filtrarHistorico, #editarCliente, #agregarDireccion, #editarDireccion, #guardarPedido, #agregarProducto, #agregarMetodoPago, #guardarFugaQueja').attr('disabled', true);
    
    // Se inhabilita el método de pago credito cliente
    $('option.opt-method-credito-cliente').addClass('d-none');
    
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
    // Se resetean las rutas
    $('#rutaCilMat, #rutaCilVesp, #rutaEstMat, #rutaEstVesp').text('Sin ruta');

    // Se reinicia el select de las direcciones
    $('select#direccionCliente').children('option').remove();
    $('select#direccionCliente').append('<option>Sin direcciones</option>');

    // Se quitan los casos y oportunidades
    $('div#historic-data table.table-gen tbody').children('tr').remove();

    // Se remueven los datos personalizados del cliente del form de pedidos
    $('#desdePedido, #hastaPedido, #zonaVentaPedido').val('');

    // Se remueven los datos personalizados del cliente en quejas y figas
    $('#emailFugaQueja, #telefonoFugaQueja').val('');
    
    // Se remueven los badge de información adicional del cliente
    $('.badgesClientes').addClass('d-none');

    // Se oculta el select de casos pendientes
    $('select#casoPedido').parent().parent().addClass('d-none');
    $('select#casoPedido').children('option').remove();
    customerGlobal = null;
    resurtidosPendientesCliente = null;
    resetProductList();
}

// Resetea la tabla de productos de los pedidos y métodos de pago
function resetProductList(){
    // Productos
    $('.productosCilindroPedido').children('tbody').children('tr').remove();
    $('.productosEstacionarioPedido').children('tbody').children('tr').remove();

    $('.productosCilindroPedido').parent().parent().addClass('d-none');
    $('.productosEstacionarioPedido').parent().parent().addClass('d-none');
    
    $('#sinProductos').removeClass('d-none');
    
    // Métodos de pago
    $('.productosMetodoPago').children('tbody').children('tr').remove();
    $('.productosMetodoPago').parent().parent().addClass('d-none');
    $('#sinMetodosPago').removeClass('d-none');
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

// Regresa el valor de un input tiempicker al formato de netsuite
function formatTime(value, format = 'hh:mm a') {
    if ( value ) {
        let hora = value.split(':');
        let customDateTime = new Date();
    
        if ( hora.length ) {
    
            customDateTime.setHours(hora[0]);
            customDateTime.setMinutes(hora[1]);
    
            return moment(customDateTime).format(format);
    
        }
    }

    return '';
}

// Debe limpiarse el formulario
$('select#plantas').on('change', function(e) {
    clearCustomerInfo();
    resetProductList();
    clearFields();
});

// Valida que el valor introducido a un input siempre sea de tipo numérico con máximo 2 decimales
function onlyNumbers(value, input) {
    value = value.replace(/[^0-9.]/g, ''); 
    value = value.replace(/(\..*)\./g, '$1');
    value = (value.indexOf('.') >= 0) ? (value.substr(0, value.indexOf('.')) + value.substr(value.indexOf('.'), 3)) : value;
    
    $(input).val(value);
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
        buttons:{
            cancel: {
              text: "Cancelar",
              value: null,
              visible: true,
              className: "btn-danger-cc",
              closeModal: true,
            },
            confirm: {
              text: "Aceptar",
              value: true,
              visible: true,
              className: "btn-primary-cc",
              closeModal: true
            }
        },
        closeOnEsc: false,
        closeOnClickOutside: false,
    };

    swal(swalObj).then((resp) => {
        callback(resp);
    }).catch(swal.noop);
}

// Método para ver el detalle de los casos y/o oportunidades
function verDetalles($this) {
    $('.campos-casos, .campos-oportunidad, .campos-art, .campos-metodos-pago, .casos-imagenes').addClass('d-none');
    $('table.table-notas tbody').children('tr').remove();
    $('table.table-desgloce-art tbody').children('tr').remove();
    $('table.table-desgloce-metodos-pago tbody').children('tr').remove();
    $('.casos-imagenes').children().remove();
    
    let pedido = $($this).closest("tr").data("item");
    console.log(pedido);

    // Datos generales del modal
    $("#verDetallesCliente").html(customerGlobal.id + " - " + customerGlobal.nombreCompleto);
    $("#verDetallesTipoServicio").html(customerGlobal.typeCustomer.trim());
    $("#verDetallesTelefono").html(customerGlobal.telefono.trim());
    
    if ( $($this).hasClass('oportunidades') ) {
        let direccion = '';

        //direccion += addressObj['nameStreet'];
        pedido['numExterno'] ? direccion+= ' #'+pedido['numExterno'] : '';
        pedido['numInterno'] ? direccion+= ' #'+pedido['numInterno'] : '';
        pedido['colonia']    ? direccion+= ', Col. '+pedido['colonia'] : '';
        pedido['stateName']  ? direccion+= ', '+pedido['stateName'] : '';
        pedido['city']       ? direccion+= ', '+pedido['city'] : '';
        pedido['zip']        ? direccion+= ', C.P. '+pedido['zip'] : '';
        pedido['zonaVenta']  ? direccion+= 'Zona de venta: '+pedido['zonaVenta'] : '';
        pedido['ruta']       ? direccion+= 'Ruta: '+pedido['ruta'] : '';

        $("#verDetallesServicio").html(pedido.numeroDocumento);
        $("#verDetallesDireccion").html(pedido.rutaAsignada ? pedido.rutaAsignada : 'Sin asignar');
    
        $("#verDetallesVehiculo").html(pedido.vehiculo ? pedido.vehiculo.trim() : 'Sin asignar');
        $("#verDetallesZona").html(pedido.zone ? pedido.zone : 'Sin asignar');
        $("#verDetallesUsuarioMonitor").html(pedido.monitor ? pedido.monitor.trim() : 'Sin asignar');
        $("#verDetallesDireccion2").html(direccion);
        // $("#verDetallesDireccion2").html($('#direccionCliente').children(':selected').text());
        // $("#verDetallesFechaPrometida").html(dateFormatFromDate(pedido.fecha_prometida, '5'));
        $("#verDetallesFechaPrometida").html(pedido.cierrePrevisto ? pedido.cierrePrevisto : 'Sin asignar');
        $("#verDetallesFechaPedido").html(pedido.fecha ? pedido.fecha : 'Sin asignar');
        // $("#verDetallesFechaPedido").html(pedido.fecha ? dateFormatFromDate(pedido.fecha, '5') : 'Sin asignar');
        $("#verDetallesFechaNotificacion").html(pedido.fechaNotificacion ? pedido.fechaNotificacion : 'Sin asignar');// Usar el método de Alexis para ver la hora
        $("#verDetallesAgenteAtiende").html(pedido.representanteVentas ? pedido.representanteVentas : userName);
        $("#verDetallesConductorAsignado").html(pedido.conductorAsignado ? pedido.conductorAsignado : 'Sin asignar');
        $("#verDetallesRuta").html(pedido.rutaAsignada ? pedido.rutaAsignada : 'Sin asignar');
        $("#verDetallesTipoProducto").html(pedido.tipoServicio ? pedido.tipoServicio : 'N/A');
        $("#verDetallesObservaciones").html(pedido.nota ? pedido.nota : 'Sin asignar');
        
        $("#verDetallesTiempoNotificacion")
        .html(pedido.horaNoti ? 
            getRestTime(dateFormatFromString(pedido.fechaNotificacion+(pedido.horaNoti ? " "+pedido.horaNoti : ''), "2")) 
            : 'Sin asignar'
        );

        $('.campos-oportunidad').removeClass('d-none');

        // $("#verDetallesTipoProducto").html("");
        // vrTiposServicios.forEach(element => {
        //     if(pedido.servicio == element.id) {
        //         $("#verDetallesTipoProducto").html(element.nombre);
        //     }
        // });
        setMetodosPago(pedido, 'oportunidad');
        getMsgNotes(pedido, 'oportunidad');
        getItemPedido(pedido, 'oportunidad');

    } else if ( $($this).hasClass('casos') ) {

        $("#verDetallesServicio").html(pedido.numeroCaso);

        $(".casos-tipo").html(pedido.asunto ? pedido.asunto.trim() : 'Sin asignar');
        $(".casos-concepto").html(pedido.conceptoCaso ? pedido.conceptoCaso : 'Sin asignar');
        $(".casos-fecha-visita").html(pedido.fecha_visita ? pedido.fecha_visita : 'Sin asignar');
        $(".casos-horario-preferido").html(pedido.hora_visita ? pedido.hora_visita : 'Sin asignar');
        $(".casos-articulo").html(pedido.articulo ? pedido.articulo : 'Sin asignar');
        $(".casos-prioridad").html(pedido.prioridad ? pedido.prioridad : 'Sin asignar');
        $(".casos-email").html(pedido.email ? pedido.email : 'Sin asignar');
        $(".casos-telefono").html(pedido.telefono ? pedido.telefono : userName);
        $(".casos-servicio-asociado").html(pedido.oppName ? pedido.oppName : 'Sin asignar');
        $(".casos-caso-asociado").html(pedido.casoAsociado ? pedido.casoAsociado : 'Sin asignar');
        $(".casos-descripcion").html(pedido.tipoServicio ? pedido.tipoServicio : 'N/A');
        // $(".casos-notas-adicionales").html(pedido.nota ? pedido.nota : 'Sin asignar');
        
        $('.campos-casos').removeClass('d-none');

        getMsgNotes(pedido, 'caso');
        // getItemPedido(pedido, 'caso');
    }

    $("#formVerDetallesPedidos").modal("show");
}

// Obtienes los mensajes/notas de un pedido o caso
function getMsgNotes(pedido, tipo) {
    let url  = null;
    let data = null;

    if ( tipo == 'caso' ) {
        url = urlGetMessageandNotes;
        data = { case : pedido.id_Transaccion };
    } else {
        url = urlGetNoteOpp;
        data = { opp : pedido.id_Transaccion };
    }

    let settings = {
        url    : url,
        method : 'POST',
        data   : JSON.stringify(data)
    }

    setAjax(settings).then((response) => {
        // console.log(response);
        let imgs = [];
        mensajeData = response.messageData;
        noteData = [];
        if ( tipo == 'caso' ) {// Casos
            imgs = response.imgData;
            noteData = response.noteData;
            $(".casos-notas-adicionales").html(mensajeData && mensajeData[0] ? mensajeData[0].message : 'Sin asignar');
        } else {// Oportunidades
            noteData = response.data;
        }

        if( noteData.length ) {// Tiene más de una nota
            for ( var key in noteData ) {
                if ( noteData.hasOwnProperty( key ) ) {
        
                    $('table.table-notas tbody').append(
                        '<tr class="notas-opp-caso">'+
                            '<td class="ion-text-center sticky-col fw-bold">'+noteData[key].author+'</td>'+
                            '<td class="ion-text-center sticky-col fw-bold">'+noteData[key].date+'</td>'+
                            '<td class="ion-text-center sticky-col fw-bold">'+noteData[key].note+'</td>'+
                        '</tr>'
                    );
                }
            }
        } else {
            $('table.table-notas tbody').append(
                '<tr class="notas-opp-caso">'+
                    '<td class="text-center" colspan="3">Sin notas adicionales</td>'+
                '</tr>'
            );
        }

        // Tiene fotos por mostrar
        if( imgs.length ) {// Tiene más de una nota
            for ( var key in imgs ) {
                if ( imgs.hasOwnProperty( key ) ) {
                    $('.casos-imagenes').append(
                        '<div class="col-6">'+
                            '<img class="img-thumbnail evidencia-img" alt="'+imgs[key].name+'" src="'+imgs[key].url+'">'+
                        '</div>'
                    );
                }
            }
            $('.casos-imagenes').removeClass('d-none');
        }
       
    }).catch((error) => {
        console.log(error);
    });
}

// Obtiene el artículo asociado a una oportunidad
function getItemPedido(pedido, tipo) {
    let url  = null;
    let data = null;

    if ( tipo == 'caso' ) {
        url = urlGetItemsOpp;
        data = { case : pedido.id_Transaccion };
    } else {
        url = urlGetItemsOpp;
        data = { opp : pedido.id_Transaccion };
    }

    let settings = {
        url    : url,
        method : 'POST',
        data   : JSON.stringify(data)
    }

    setAjax(settings).then((response) => {
        let items = response.data;
        let totalFinal = 0;

        if ( items.length ) {
            for ( var key in items ) {
                let cantidad = 0;
                let total = Number(items[key].amount);
                let tax = 0;

                if( [articuloGasLp].includes( parseInt(items[key].itemId) ) ) { // Es gas LP
                    cantidad = Number(items[key].quantity);
                    tax = Number(items[key].taxAmount);
                }
                else if ( [articuloDesc].includes( parseInt(items[key].itemId) ) ) { // Es un item de descuento
                    cantidad = 1;
                } else { // Se trata de un producto de cilindro
                    cantidad = parseFloat(Number(items[key].capacidad) * Number(items[key].quantity)).toFixed(0);
                    tax = Number(items[key].taxAmount);
                }

                totalFinal += ( total + tax );
                
                $('table.table-desgloce-art tbody').append(
                    '<tr class="'+( items[key].itemId == articuloDesc ? 'descuento' : '' )+'">'+
                        '<td class="">'+items[key].item+'</td>'+
                        '<td class="text-center">'+cantidad+'</td>'+
                        '<td class="text-center">$'+parseFloat( total + tax ).toFixed(2)+'</td>'+
                    '</tr>'
                )
            }

            $('table.table-desgloce-art tfoot').find('.total-pedido-detalle').text('$'+parseFloat(totalFinal).toFixed(2));

            $('.campos-art').removeClass('d-none');
        }

        console.log(response);
       
    }).catch((error) => {
        console.log(error);
    });
}

// Enlista los métodos de pago de un pedido
function setMetodosPago(pedido, tipo) {
    let obj = JSON.parse(pedido.objMetodosPago);
    let totalFinal = 0;
    let items = obj.pago ?? [];

    if ( items.length ) {
        for ( var key in items ) {
            let monto = Number(items[key].monto);
            totalFinal += monto;

            let metodo = metodosPago.find( metodo => metodo.id === items[key].tipo_pago );
            
            $('table.table-desgloce-metodos-pago tbody').append(
                '<tr>'+
                    '<td class="">'+( metodo ? metodo.method : 'N/A' )+'</td>'+
                    '<td class="text-center">'+( items[key].folio ? items[key].folio : 'N/A' ) +'</td>'+
                    '<td style="text-align: right;">$'+parseFloat(monto).toFixed(2)+'</td>'+
                '</tr>'
            )
        }

        $('table.table-desgloce-metodos-pago tfoot').find('.total-metodos-pago-detalle').text('$'+parseFloat(totalFinal).toFixed(2));

        $('.campos-metodos-pago').removeClass('d-none');
    }

    console.log(obj);
}

// Abre el modal para cancelar el pedido
function cancelarPedido($this) {
    let pedido = $($this).closest("tr").data("item");

    $('#cancelarOppMotivo').val('');
    $("#cancelarOppObservaciones").val('');
    // $('#cancelarOppMotivo').val('').trigger('change');
    $("#cancelarOppModal").data("item", pedido);
    $("span#cancelarOppPedido").html(pedido.id_Transaccion ? " - " + pedido.id_Transaccion : '');
    $("#cancelarOppModal").modal("show");
}

// Formatea la hora de netsuite para ser compatible con el timepicker del formulario
function formatTimeToPicker (value, format = 'HH:mm') {
    if ( value ) {
        let medioDia = value.split(" ");
        let horaInicio = value.split(":");

        // Se le suma 12 horas por el formato de 24 hrs
        if ( medioDia[1].toUpperCase() == 'PM' ) {
            horas = new Number(horaInicio[0]) + 12;
        } else {
            horas = horaInicio[0];
        }

        let customDate = new Date();
        customDate.setHours(horas);
        customDate.setMinutes(horaInicio[1].split(" ")[0]);

        return moment(customDate).format(format);
        // $('#desdePedido').val(horaInicioStr);
    }

    return '';
}

// Call a global ajax method
function setAjax(settings) {
    // Generamos el AJAX dinamico para las peticiones relacionadas con peddos
    return new Promise((resolve, reject) => {
        $.ajax({
            url: settings.url,
            method: settings.method,
            data: settings.data ?? null,
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