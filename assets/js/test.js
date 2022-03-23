// Se inyecta la información del usuario logueado
$('span.user-name').text(userName);
$('span#role').text(userRole);

// Evento que dispara la búsqueda de un cliente
$('input#buscarCliente').on('keypress',function(e) {
    if( e.which == 13 ) {
        let buscar = $(this).val();
        let tieneProductos = $('#sinProductos').hasClass('d-none');
        if ( tieneProductos ) {// Tiene productos agregados
            swal({
                title: 'Tiene un pedido en curso, ¿Está seguro de continuar con la búsqueda de un cliente nuevo?',
                icon: 'warning',
                buttons:["Cancelar", "Aceptar"],
                dangerMode: true,
            }).then((accept) => {
                if ( accept ) {
                    searchCustomer( buscar );
                }
            }).catch(swal.noop);
        } else {
            searchCustomer( buscar );
        }
    }
});

// Función para filtrar clientes por un texto
function searchCustomer(search) {
    loadMsg('Espere un momento...');

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
        // console.log('Cliente encontrado', response);
        customerGlobal = response.data[0];
        setCustomerInfo(response.data[0]);
        $('#agregarDireccion, #guardarPedido, #agregarProducto, #agregarMetodoPago, #guardarFugaQueja').attr('disabled', false);
    }).catch((error) => {
        infoMsg('error', 'Cliente no encontrado', 'Verifique que la información sea correcta');
        // Limpia los campos de cliente
        clearCustomerInfo();
        console.log(error);
    });
}

// Función para enviar la información del cliente al frontend
function setCustomerInfo(customer) {
    let direcciones = customer.addr;
    let zonaVenta = direccionDefault = null;
    
    $('#badgeActivo, #badgeInactivo, #badgeDescuento').addClass('d-none');
    $('#badgeDescuento').children('span.badge').removeClass('bg-danger-cc, bg-success-cc'); // Se le quita la clase success o danger
    
    $('#idCliente').text(customer.id);
    $('#nombreCliente').text(customer.nombreCompleto);
    $('#telefonoCliente').text(customer.telefono);
    $('#giroCliente').text(customer.giroCliente);
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
        } else if ( customer.tipoDescuento == "2" ) {// Lineal
            tipoDescuento = 'Lineal';
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
                    '<option '+(direcciones[key].defaultShipping ? 'selected' : '')+' data-address='+"'"+JSON.stringify(direcciones[key])+"'"+' value="'+direcciones[key].idAddressLine+'">'+textoDireccion+'</option>'
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

    // Setea la información del modal
    setAlianzaComercial(customer);
}

// Setea los datos dependiendo del tipo de alianza del cliente: contrato, crédito o contado
function setAlianzaComercial(customer) {
    let tipoAlianza = customer.alianzaComercial.toUpperCase();
    let infoComercial = customer.objInfoComercial;
    $('tr.alianza').addClass('d-none');
    if ( tipoAlianza ==  'CONTRATO' ) {
        $('#badgeAlianza').removeClass('d-none');
        $('#badgeAlianza').children('span').text('Contrato');
        $('.alianza-no-contrato, .alianza-fecha-inicio, .alianza-limite-credito, .alianza-dias-credito, .alianza-saldo-disponible, .alianza-dias-vencidos, .alianza-monto-adeudo').removeClass('d-none')
        $('.alianza-fecha-alta').children('td').siblings("td:nth-child(2)").text(infoComercial.fechaAlta ? infoComercial.fechaAlta : 'Sin asignar');
        $('.alianza-no-contrato').children('td').siblings("td:nth-child(2)").text(infoComercial.contrato ? infoComercial.contrato : 'Sin asignar');
        $('.alianza-fecha-inicio').children('td').siblings("td:nth-child(2)").text(infoComercial.fechaInicio ? infoComercial.fechaInicio : 'Sin asignar');
        $('.alianza-limite-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.limiteCredito ? infoComercial.limiteCredito : 'Sin asignar');
        $('.alianza-dias-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.contrato ? infoComercial.contrato : 'Sin asignar');
        $('.alianza-saldo-disponible').children('td').siblings("td:nth-child(2)").text(infoComercial.saldoDisponible ? infoComercial.saldoDisponible : 'Sin asignar');
        $('.alianza-dias-vencidos').children('td').siblings("td:nth-child(2)").text(infoComercial.diasAtraso ? infoComercial.diasAtraso : 'Sin asignar');
        $('.alianza-monto-adeudo').children('td').siblings("td:nth-child(2)").text(infoComercial.creditoUtilizado ? infoComercial.creditoUtilizado : 'Sin asignar');
    } else if ( tipoAlianza ==  'CREDITO' ) {
        $('#badgeAlianza').children('span').text('Crédito');
        $('#badgeAlianza').removeClass('d-none');
        $('.alianza-fecha-inicio, .alianza-limite-credito, .alianza-dias-credito, .alianza-saldo-disponible, .alianza-dias-vencidos, .alianza-monto-adeudo').removeClass('d-none')
        $('.alianza-fecha-alta').children('td').siblings("td:nth-child(2)").text(infoComercial.fechaAlta ? infoComercial.fechaAlta : 'Sin asignar');
        $('.alianza-fecha-inicio').children('td').siblings("td:nth-child(2)").text(infoComercial.fechaInicio ? infoComercial.fechaInicio : 'Sin asignar');
        $('.alianza-limite-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.limiteCredito ? infoComercial.limiteCredito : 'Sin asignar');
        $('.alianza-dias-credito').children('td').siblings("td:nth-child(2)").text(infoComercial.contrato ? infoComercial.contrato : 'Sin asignar');
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

// Función para obtener la lista de estatus de las oportunidades
function getListaStatusOpp() {
    let settings = {
        url      : urlGetEstadosOpp,
        method   : 'GET',
    }

    setAjax(settings).then((response) => {
        estadosOppArr = response.data;
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
                    $("select#articuloFugaQueja").append( articulo );
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
        $("select#metodoPagoPedido").append('<option value="">Seleccione una opción</option>')
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
    let table = $('div#historic-data table').DataTable();
    
    table.destroy();
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
    console.log('Casos', casos);
    console.log('Oportunidades', oportunidades);
    // Checa casos
    if ( casos.length ) {
        // numero de documento, fecha
        for ( var key in casos ) {
            if ( casos.hasOwnProperty( key ) ) {
                $('div#historic-data table.table-gen tbody').append(
                    setTrOppCases( casos[key], 'casos' )
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
                    setTrOppCases( oportunidades[key], 'oportunidades' )
                );

                $('select#asociarServicioFugaQueja').append('<option value="'+oportunidades[key].id_Transaccion+'"> No. documento: '+oportunidades[key].numeroDocumento+' - Fecha: '+oportunidades[key].fecha+'</option>');

            }
        }
    } else {
        // console.warn('No hay oportunidades por cargar');
    }

    // Vuelve a mostrar la tabla
    $('div#historic-data table').DataTable();
    $('div#historic-data').fadeIn('slow');
}

// Método para llenar la tabla de casos y oportunidades
function setTrOppCases(item, type = 'casos') {
     
    let tr = 
    '<tr data-item='+"'"+JSON.stringify(item)+"'"+'>'+
        '<td class="text-center sticky-col" style="z-index: 50;">'+
            '<div class="btn-group dropend vertical-center">'+
                '<i class="fa-solid fa-ellipsis-vertical c-pointer dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="font-size: 24px;"></i>'+
                '<ul class="dropdown-menu">'+
                    '<li onclick="verDetalles(this)" class="px-2 py-1 c-pointer" style="font-size: 16px">'+
                        '<i class="fa-solid fa-eye color-primary"></i> Ver detalles'+
                    '</li>'+
                    '<li onclick="cancelarPedido(this)" class="px-2 py-1 c-pointer" style="font-size: 16px">'+
                        '<i class="fa-solid fa-circle-xmark text-danger"></i> Cancelar servicio'+
                    '</li>'+
                '</ul>'+
            '</div>'+
            // '<div style="position: absolute; right: 0; top: 0; height: 100%; width: 1px; background-color: #000;"></div>'+
        '</td>'+
        '<td>'+
            '<div class="text-center">'+
                '<input class="form-check-input" type="checkbox" value="" id="'+item.id_Transaccion+'">'+
            '</div>'+
        '</td>'+
        '<td><button class="btn btn-danger"></button></td>'+
        '<td>'+( item.fecha ?? 'Sin fecha')+'</td>'+//Fecha creación
        '<td>'+( type == "casos" ? ( item.fecha_visita ? item.fecha_visita : 'Sin fecha prometida' ) : 'Sin fecha prometida' )+'</td>'+// Fecha prometida
        '<td>'+( type == "casos" ? ( item.articulo ?? 'Sin asignar' ) : ( item.tipoServicio ? item.tipoServicio : 'Sin asignar' ) )+'</td>'+// Tipo servicio
        '<td>'+( type == "casos" ? ( item.numeroCaso ?? 'Sin asignar' ) : ( item.numeroDocumento ?? 'Sin asignar' ) )+'</td>'+// Numero de documento u caso
        '<td>'+( type == "casos" ? ( item.asunto ?? 'Sin asignar' ) : ( item.tipoTransaccion ?? 'Sin asignar' ) )+'</td>'+// Asunto
        '<td>'+( type == "casos" ? ( item.fecha_visita ?? 'Sin asignar' ) : ( item.cierrePrevisto ?? 'Sin asignar' ) )+'</td>'+// Fecha visita
        '<td>'+( type == "casos" ? ( item.hora_visita ?? 'Sin asignar' ) : ( item.horaVisita ?? 'Sin asignar' ) )+'</td>'+// Hora visita
        '<td>'+( type == "casos" ? ( item.estatus ?? 'Sin asignar' ) : ( item.estado ?? 'Sin asignar' ) )+'</td>'+// Estado
        '<td>'+( type == "casos" ? ( item.prioridad ?? 'Sin asignar' ) : 'N/A' )+'</td>'+// Prioridad
        // '<td>'+( item.hora_visita ?? 'Sin hora visita' )+'</td>'+
        // '<td>'+( item.numeroDocumento ?? 'Sin número de documento' )+'</td>'+
        // '<td>'+( item.numeroCaso ?? 'Sin número de caso' )+'</td>'+
        // '<td>'+( item.asunto ?? 'Sin asunto' )+'</td>'+
        // '<td>'+( item.nombreCliente ?? 'Sin nombre de cliente' )+'</td>'+
        // '<td>'+( item.telefono ?? 'Sin teléfono' )+'</td>'+
        // '<td>'+( item.representanteVentas ?? 'Sin agente' )+'</td>'+
        // '<td>'+( item.monitor ?? 'Sin asignado' )+'</td>'+
        // '<td>'+( item.estado ?? 'Sin estado' )+'</td>'+
        // '<td>'+( item.prioridad ?? 'Sin prioridad' )+'</td>'+
        // '<td>'+( item.motivoCancelacion ?? 'Sin motivo cancelación' )+'</td>'+
        // '<td>'+( item.cierrePrevisto ?? 'Sin cierre previsto' )+'</td>'+
        // '<td>'+( item.horaCierre ?? 'Sin hora cierre' )+'</td>'+
        // '<td>'+( item.origenServicio ? item.origenServicio : 'Sin origen servicio' )+'</td>'+
        // '<td>'+( item.tipoServicio ?? 'Sin tipo servicio' )+'</td>'+
        // '<td>'+( item.articulo ?? 'Sin artículo' )+'</td>'+
        // '<td>'+( item.fechaNotificacion ?? 'Sin fecha notificación' )+'</td>'+
        // '<td>'+( item.tipoTransaccion ?? 'Sin tipo transacción' )+'</td>'+
        // '<td>'+( item.nota ?? 'Sin nota' )+'</td>'+
        // '<td>'+( item.conductorAsignado ?? 'Sin conductor asignado' )+'</td>'+
        // '<td>'+( item.metodoPago ?? 'Sin método de pago' )+'</td>'+
        // '<td>'+( item.nota_rapida ?? 'Sin nota rápida' )+'</td>'+
        // '<td>'+( item.unidad ?? 'Sin unidad' )+'</td>'+
    '</tr>';

    return tr;
}

// Método para limpiar la data del cliente cuando falla una búsqueda
function clearCustomerInfo () {
    // Inhabilita el botón de agregar dirección
    $('#agregarDireccion, #guardarPedido, #agregarProducto, #agregarMetodoPago, #guardarFugaQueja').attr('disabled', true);

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

    // Se remueven los datos personalizados del cliente en quejas y figas
    $('#emailFugaQueja, #telefonoFugaQueja').val('');

    // Se remueven los badge de información adicional del cliente
    $('#badgeAlianza, #badgeDescuento, #badgeActivo, #badgeInactivo').addClass('d-none');

    customerGlobal = null;
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
function formatTime(value, format = 'h:mm a') {
    let hora = value.split(':');
    let customDateTime = new Date();

    if ( hora.length ) {

        customDateTime.setHours(hora[0]);
        customDateTime.setMinutes(hora[1]);

        return moment(customDateTime).format(format);

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
        buttons:["Cancelar", "Aceptar"],
        closeOnEsc: false,
        closeOnClickOutside: false,
    };

    swal(swalObj).then((resp) => {
        callback(resp);
    }).catch(swal.noop);
}

// Método para ver el detalle de los casos y/o oportunidades
function verDetalles($this) {
    let pedido = $($this).closest("tr").data("item");
    console.log(pedido);

    $("#verDetallesCliente").html(customerGlobal.id + " - " + customerGlobal.nombreCompleto);
    $("#verDetallesTipoServicio").html(customerGlobal.typeCustomer.trim());
    $("#verDetallesTelefono").html(customerGlobal.telefono.trim());
    $("#verDetallesServicio").html(pedido.id_Transaccion);
    $("#verDetallesDireccion").html(pedido.rutaAsignada ? pedido.rutaAsignada : 'Sin asignar');

    $("#verDetallesVehiculo").html(pedido.vehiculo ? pedido.vehiculo.trim() : 'Sin asignar');
    $("#verDetallesZona").html(pedido.zone ? pedido.zone : 'Sin asignar');
    $("#verDetallesUsuarioMonitor").html(pedido.monitor ? pedido.monitor.trim() : 'Sin asignar');
    $("#verDetallesDireccion2").html($('#direccionCliente').children(':selected').text());
    // $("#verDetallesFechaPrometida").html(dateFormatFromDate(pedido.fecha_prometida, '5'));
    $("#verDetallesFechaPrometida").html(pedido.cierrePrevisto ? pedido.cierrePrevisto : 'Sin asignar');
    $("#verDetallesFechaPedido").html(pedido.fecha ? pedido.fecha : 'Sin asignar');
    // $("#verDetallesFechaPedido").html(pedido.fecha ? dateFormatFromDate(pedido.fecha, '5') : 'Sin asignar');
    $("#verDetallesFechaNotificacion").html(pedido.fechaNotificacion ? pedido.fechaNotificacion : 'Sin asignar');// Usar el método de Alexis para ver la hora
    $("#verDetallesAgenteAtiende").html(pedido.representanteVentas ? pedido.representanteVentas : userName);
    $("#verDetallesConductorAsignado").html(pedido.conductorAsignado ? pedido.conductorAsignado : 'Sin asignar');
    $("#verDetallesRuta").html(pedido.rutaAsignada ? pedido.rutaAsignada : 'Sin asignar');
    
    $("#verDetallesTiempoNotificacion")
    .html(pedido.horaNoti ? 
        getRestTime(dateFormatFromString(pedido.fechaNotificacion+(pedido.horaNoti ? " "+pedido.horaNoti : ''), "2")) 
        : 'Sin asignar'
    );

    // $("#verDetallesTipoProducto").html("");
    // vrTiposServicios.forEach(element => {
    //     if(pedido.servicio == element.id) {
    //         $("#verDetallesTipoProducto").html(element.nombre);
    //     }
    // });
    // if($("#verDetallesTipoProducto").html().trim() == "") {
    //     $("#verDetallesTipoProducto").html("Desconocido");
    // }
    // $("#verDetallesContrato").html(pedido.contrato ? pedido.contrato : 'Sin contrato');
    // $("#verDetallesTiempoNotificacion").html(pedido.fecha_hora_notificacion ? getRestTime(dateFormatFromString(pedido.fecha_notificacion+(pedido.hora_notificacion ? " "+pedido.hora_notificacion : ''), "1")) : 'Sin asignar');
    // $("#verDetallesObservaciones").html(pedido.observaciones ? pedido.observaciones : 'Sin observaciones');
    $("#formVerDetallesPedidos").modal("show");
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