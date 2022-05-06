// Revisa que acción ejecutará el modal de acuerdo al botón cliqueado
$("#agregarDirecciones, #agregarDireccion").click( function() {
    let id = $(this).attr('id');
    $('.dias-semana').prop('checked', true);

    if ( id == 'agregarDirecciones' ) {
        $("#tipoAccionDireccion").val('lista');
        $("input[name=tipoAccionFormCliente][value=1]").prop("checked", true);
        $("input[name=tipoAccionFormCliente]:checked").trigger("change");
        $("#tipoServicioFormCliente").val("1");
        //$($(".dato-facturacion").addClass("d-none"));
        $("#tipoServicioFormCliente").trigger("change");
    } else if ( id == 'agregarDireccion' ) {
        if(customerGlobal.rfc) {
            $($(".dato-facturacion").removeClass("d-none"));
        } else {
            $($(".dato-facturacion").addClass("d-none"));
        }
        $("#tipoAccionDireccion").val('guardar');
    }
});

// Si el cliente requiere factura, se mostrarán esos campos en el form de cliente
$('input[name=requiereContrato]').on('change', function(e) {
    let val = $("input[name=requiereContrato]:checked").val();
    if ( val == "si" ) {// Se muestran los datos exclusivos de factura
        $(".dato-contrato").removeClass("d-none");
    } else {// Se ocultan los campos de factura
        $(".dato-contrato").addClass("d-none");
    }
});

// Si el cliente requiere factura, se mostrarán esos campos en el form de cliente
$('input[name=requiereFactura]').on('change', function(e) {
    let val = $("input[name=requiereFactura]:checked").val();
    if ( val == "si" ) {// Se muestran los datos exclusivos de factura
        $(".dato-facturacion").removeClass("d-none");
        if($(".table-address tbody").children("tr").length == 1 && $(".table-address tbody").children("tr").text().trim().toLowerCase() == 'sin direcciones') {
            $(".table-address tbody").children("tr").find("td").prop("colspan", "4");
        }
    } else {// Se ocultan los campos de factura
        $(".dato-facturacion").addClass("d-none");
        if($(".table-address tbody").children("tr").length == 1 && $(".table-address tbody").children("tr").text().trim().toLowerCase() == 'sin direcciones') {
            $(".table-address tbody").children("tr").find("td").prop("colspan", "3");
        }
    }
});

// Si el cliente es de régimen moral, muestra el campo para la razón social, caso contrario, se muestran los de régimen físico (Doméstico)
$('input[name=tipoRegimen]').on('change', function(e) {
    let val = $("input[name=tipoRegimen]:checked").val()
    if ( val == "domestico" ) {// Se muestran los datos de régimen físico
        $(".dato-regimen-fisico").removeClass("d-none");
        $(".dato-regimen-moral").addClass("d-none");
    } else if( val == "comercial" || val == "industrial" ) {// Se muestran los campos de régimen moral
        $(".dato-regimen-moral").removeClass("d-none");
        $(".dato-regimen-fisico").addClass("d-none");
    }
});

// Cuando el select de estados cambie, manda a llamar la petición de obtener ciudades
$('select#direccionCliente').on('change', function(e) {
    let direccion = $( this ).children('option:selected').data('address');
    console.log('esta es la dirección', direccion);
    resetProductList();
    if ( direccion ) {
        setColoniaZonaData( direccion );
    } else {// Podría ser buena práctica meter este bloque de código en una función
        // Estos campos están en la tarjeta de cliente
        $('#zonaVentaCliente').text('Sin Zona de Venta');
        $('#zonaPrecioCliente').text('Sin Zona de Precio');
        $('#rutaCliente').text("Sin ruta");
        
        // Estos campos están en el formulario de pedido
        $('#zonaVentaPedido, #desdePedido, #hastaPedido').val('');
    }
});

// Setea el formulario de cliente para guardar uno nuevo
$("#agregarCliente").click(function () {
    clearCustomerForm();
    next('inicio');
    $("div.domicilio-tab").removeClass('d-none');
    $("div.guardar-cliente-edit").addClass('d-none');
    $("button.next-to-domicilio").parent().removeClass('d-none');// Se muestra el botón de siguiente para visualizar la vista de domicilio
    
    $($(".dato-facturacion").addClass("d-none"));
    $("#home-view, #btnMenu").addClass("d-none");
    $("#form-client-view, #btnBack").removeClass("d-none");
    $("#btnBack").data("back", "home-view");
    $("#btnBack").data("current", "form-client-view");
    $("#btnBack").data("title-back", "Call Center");
    $("#header-title").html("Alta de cliente");
});

// Configura el formulario de edición del cliente
$("#editarCliente").click(function () {
    clearCustomerForm();
    next('inicio');
    $("#home-view, #btnMenu").addClass("d-none");
    $("#form-client-view, #btnBack").removeClass("d-none");
    $("#btnBack").data("back", "home-view");
    $("#btnBack").data("current", "form-client-view");
    $("#btnBack").data("title-back", "Call Center");
    $("#header-title").html("Edición de cliente");

    $("div.domicilio-tab").addClass('d-none');
    $("div.guardar-cliente-edit").removeClass('d-none');
    $("button.next-to-domicilio").parent().addClass('d-none');// Se remueve el botón de siguiente para visualizar la vista de domicilio

    // Este input definirá si es una edición por el id interno del cliente
    $('#idInternoFormCliente').val(customerGlobal.id);

    // Se prellenan los inputs del form
    if ( customerGlobal.typeCustomer == "Doméstico" ) {
        $("input#tipoRegimen1").prop('checked', true);
        $(".dato-regimen-fisico").removeClass("d-none");
        $(".dato-regimen-moral").addClass("d-none");
    } else if ( customerGlobal.typeCustomer == "Comercial" ) {
        $("input#tipoRegime2").prop('checked', true);
    } else if ( customerGlobal.typeCustomer == "Industrial" ) {
        $("input#tipoRegime3").prop('checked', true);
    }

    // Si es comercial o industrial
    if ( customerGlobal.typeCustomer == "Comercial" || customerGlobal.typeCustomer == "Industrial" ) {
        $('#nombreRazonSocialFormCliente').val(customerGlobal.nombreCompleto);
        $('#giroNegocioFormCliente').parent().removeClass('d-none');
        $(".dato-regimen-fisico").addClass("d-none");
        $(".dato-regimen-moral").removeClass("d-none");
    }

    if ( customerGlobal.giroCustomerId ) {
        $('#giroNegocioFormCliente').val(customerGlobal.giroCustomerId);
    }

    if ( customerGlobal.rfc ) {
        $("input#requiereFactura1").prop('checked', true);
        $(".dato-facturacion").removeClass("d-none");
        $('#rfcFormCliente').val(customerGlobal.rfc);
        $('#usoCfdiFormCliente').val(customerGlobal.cdfiId);
        
    } else {
        $(".dato-facturacion").addClass("d-none");
    }

    // Falta código para prellenar los campos de contrato

    // Se setean los demás campos de forma natural
    $('#nombreFormCliente').val(customerGlobal.primerNombre);
    $('#apellidosFormCliente').val(customerGlobal.apellidos);
    
    $('#correoFormCliente').val(customerGlobal.email);
    $('#telefonoPrincipalFormCliente').val(customerGlobal.telefono);
    $('#telefonoAlternoFormCliente').val(customerGlobal.telefonoAlt);
    $('#correoAlternativoFormCliente').val(customerGlobal.emailAlt);
    $('#observacionesFormCliente').val(customerGlobal.notasCustomer);
});

// Click en guardar cliente
$("button#guardarCliente").click( function() {
    saveCustomer();
});

$('body').delegate('.check-entrega', 'click', function () {
    let address = $(this).closest('.address').data('address');
    
    if(!address.principal) {
        for (let x = 0; x < $('table.table-address tbody').find(".address").length; x++) {
            let element = $($('table.table-address tbody').find(".address")[x]);
            let addressAux = element.data('address');
            if(addressAux.principal) {
                addressAux.principal = false;
                element.data('address', addressAux);
                element.find('.check-entrega').parent().html('<i class="fa-regular fa-square color-primary check-entrega" style="cursor: pointer;"></i>');
            }

            if((x + 1) == $('table.table-address tbody').find(".address").length) {
                address.principal = true;
                $(this).closest('.address').data('address', address);
                $(this).parent().html('<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>');
            }
        }
    }
});

$('body').delegate('.check-fact', 'click', function () {
    let address = $(this).closest('.address').data('address');
    if(!address.domFacturacion) {
        for (let x = 0; x < $('table.table-address tbody').find(".address").length; x++) {
            let element = $($('table.table-address tbody').find(".address")[x]);
            let addressAux = element.data('address');
            if(addressAux.domFacturacion) {
                addressAux.domFacturacion = false;
                element.data('address', addressAux);
                element.find('.check-fact').parent().html('<i class="fa-regular fa-square color-primary check-fact" style="cursor: pointer;"></i>');
            }
            if((x + 1) == $('table.table-address tbody').find(".address").length) {
                address.domFacturacion = true;
                $(this).closest('.address').data('address', address);
                $(this).parent().html('<i class="fa-solid fa-square-check color-primary check-fact" style="cursor: pointer;"></i>');
            }
        }
    }
});

$('body').delegate('.delete-address', 'click', function () {
    let button = $(this);
    confirmMsg("warning", "¿Seguro que desea eliminar la dirección?", function(resp) {
        if( resp ) {
            let address = button.closest('.address').data('address');
            //button.parent().parent().remove();
            if((address.principal || address.domFacturacion) && $('table.table-address tbody').find(".address").length > 1) {
                button.closest('.address').remove();
                let element = $($('table.table-address tbody').find(".address")[0]);
                let addressAux = element.data('address');
                if(address.principal) {
                    addressAux.principal = true;
                    element.find('.check-entrega').parent().html('<i class="fa-solid fa-square-check color-primary check-entrega" style="cursor: pointer;"></i>');
                }
                if(address.domFacturacion) {
                    addressAux.domFacturacion = true;
                    element.find('.check-fact').parent().html('<i class="fa-solid fa-square-check color-primary check-fact" style="cursor: pointer;"></i>');
                }
                element.data('address', addressAux);              
            } else {
                let val = $("input[name=requiereFactura]:checked").val();
                $('table.table-address tbody').append(
                    '<tr>'+
                        '<td class="text-center" colspan="'+(val == 'si' ? '4' : '3')+'">Sin direcciones</td>'+
                    '</tr>'
                );
                button.closest('.address').remove();
            }
        }
    })
});

// Guarda la información de un cliente en Netsuite
function saveCustomer() {
    let canContinue      = false;
    let tipoRegimen      = $("input[name=tipoRegimen]:checked").val();
    let requiereFactura  = $("input[name=requiereFactura]:checked").val();
    let requiereContrato = $("input[name=requiereContrato]:checked").val();

    if(
        ( tipoRegimen == 'domestico' && ( !$("#nombreFormCliente").val() || !$("#apellidosFormCliente").val() ) ) || //Debe tener nombre y apellido si es doméstico
        ( tipoRegimen != 'domestico' && ( !$("#nombreRazonSocialFormCliente").val() ) ) || //Debe tener el nombre de la razón social
        ( requiereFactura  == 'si' && ( !$("#rfcFormCliente").val() || !$("#usoCfdiFormCliente").val() || !$("#correoAlternativoFormCliente").val() ) ) || // Si requiere factura, debe incluir RFC, correo de facturación y el uso de CFDI
        ( requiereContrato == 'si' && ( !$("#fechaInicioContratoCliente").val() ) ) || // Si requiere contrato debe contener fecha de inicio de contrato
        ( !$("input#idInternoFormCliente").val() && $('table.table-address tbody').find(".address").length == 0 ) // Si es un registro nuevo, debe almacenar al menos una dirección
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if ( canContinue ) {
        let idCliente    = $("input#idInternoFormCliente").val();
        let businessType = tipoRegimen != 'domestico' ? $('select#giroNegocioFormCliente').val() : "";
        let businessName = $('#nombreRazonSocialFormCliente').val();
        let cfdi         =  $('#usoCfdiFormCliente').val();
        // let middleName      = tipoRegimen != 'domestico' ? $('select#giroNegocioFormCliente').val() : "";
        let lastName     = $('input#apellidosFormCliente').val().trim();
        let rfc          = requiereFactura == 'si' ? $('input#rfcFormCliente').val() : "";
        let email        = $("input#correoFormCliente").val();
        let emailAlt     = $("input#correoAlternativoFormCliente").val();
        // let service      = $("select#tipoServicioFormCliente").val();
        // let typeService  = null;
        let regimenId    = null;

        if( tipoRegimen == 'industrial'){ regimenId = 1; }
        else if( tipoRegimen == 'domestico'){ regimenId = 3; }
        else if( tipoRegimen == 'comercial'){ regimenId = 5; }

        /*if( service == 'cilindro' ){ typeService = 1; }
        else if( service == 'estacionario' ){ typeService = 2; }
        else if( service == 'ambos' ){ typeService = 4; }*/

        let listAddress = [];
        let count = 1;
        
        for (let x = 0; x < $('table.table-address tbody').find(".address").length; x++) {
            let element = $($('table.table-address tbody').find(".address")[x]);
            let address = element.data('address');
            if( address.principal ) {
                address.tag = "00";
            } else {
                address.tag = "0"+count;
                count = count + 1;
            }
            element.data('address', address);
            listAddress.push(address);
        }

        let customer = {
            nombre : $('input#nombreFormCliente').val(),
            middleName : '',
            businessType : businessType,
            lastName : lastName,
            businessName: businessName,
            cfdi: cfdi,
            rfc : rfc,
            regimeType : regimenId != 3 ? false : true,
            // regimeType : tipoRegimen,
            isContract : requiereContrato == 'si' ? true : false,
            contractDate : requiereContrato == 'si' ? dateFormatFromDate($('#fechaInicioContratoCliente').val(), '5') : false,
            email : email,
            emails : {
                principal : email,
                adicionales : emailAlt
            },
            planta : $('select#plantas').val(),
            telefono : $("input#telefonoPrincipalFormCliente").val(),
            telefonoAlt : $("input#telefonoAlternoFormCliente").val(),
            subsidiary : 25,// Seteado de forma estática
            regimenId : regimenId,
            notaCliente : $('#observacionesFormCliente').val(),
            //typeService : typeService,
            address : listAddress
        }
        console.log(customer);
        // return;
        loadMsg('Guardando información...');
        // Se envía la información del cliente por ajax
        let dataToSend = null;
        if ( idCliente ) {// Se actualiza

            let customerEdit = {
                firstname : customer['nombre'],
                lastname : customer['lastName'],
                custentity_ptg_giro_negocio : customer['businessType'],
                custentity_mx_rfc : customer['rfc'],
                custentity_disa_uso_de_cfdi_ : customer['cfdi'],
                companyname : customer['businessName'],
                email : customer['email'],
                custentity_drt_sed_email_invoice : emailAlt,
                // custentity_ptg_plantarelacionada_ : customer['planta'],
                phone : customer['telefono'],
                altphone : customer['telefonoAlt'],
                // subsidiary : customer['subsidiary'],
                custentity_ptg_tipodecliente_ : customer['regimenId'],
                custentity_ptg_notas_cliente_ : customer['notaCliente']
            }
            dataToSend = {
                "customers" : [
                    {
                        id : idCliente,
                        bodyFields : customerEdit,
                        bodyAddress : []
                    }
                ] 
            };

        } else {// Se crea uno nuevo
            let arrayCustomers = [];
            arrayCustomers.push(customer);
    
            dataToSend = {
                "customers" : arrayCustomers,
            };
        
        }
        
        let settings = {
            url    : urlGuardarCliente,
            method : idCliente ? 'PUT' : 'POST',
            data   : JSON.stringify(dataToSend),
        }
    
        setAjax(settings).then((response) => {
            infoMsg('success', 'Registro guardado exitósamente');
            searchCustomer(response.data[0]);
            clearCustomerForm('create');
            // let telefono = $('#telefonoPrincipalFormCliente').val();
            // $( "input#buscarCliente" ).val(telefono);
            // searchCustomer(telefono);
        }).catch((error) => {
            infoMsg('error', 'Algo salió mal en la creación del registro');
            console.log('Error en la consulta', error);
        });
    } else {
        if ( !$("input#idInternoFormCliente").val() && $('table.table-address tbody').find(".address").length == 0 ) {
            alert("Favor de colocar al menos una dirección");

        } else {
            alert("Favor de llenar todos los campos con *");
        }
    }
}

// Método para limpiar todos los campos del form de clientes
function clearCustomerForm(type = 'create') {
    $('table.table-address tbody').children('tr').remove();

    $('table.table-address tbody').append(
        '<tr>'+
            '<td class="text-center" colspan="3">Sin direcciones</td>'+
        '</tr>'
    );

    $(".only-fact").addClass("d-none");

    $(".dato-facturacion").addClass("d-none");
    $(".dato-regimen-moral").addClass("d-none");
    $(".dato-regimen-fisico").removeClass("d-none");

    // Limpia los textarea e inputs de todo el form
    $('#form-client-view').find('input.form-ptg[type="text"], input.form-ptg[type="time"], input.form-ptg[type="number"], input.form-ptg[type="date"], textarea.form-ptg').val('');

    // Tab inicio
    $("input#tipoRegimen1").prop('checked', true);
    $("input#requiereFactura2").prop('checked', true);
    $("input#requiereContrato2").prop('checked', true);
    $('.dato-contrato').addClass('d-none');
    $("select#giroNegocioFormCliente").parent().addClass('d-none');

    // Tab contacto
    $("input#rfcFormCliente").parent().parent().addClass('d-none');
    $('#tab-client-contacto').find('select.form-ptg').each(function( index ) {
        $( this ).val($(this).children("option:first").val());
    });

    // Tab programación
    $('#form-client-view').find('[type="checkbox"]').prop('checked', false);
    $("input#tipoAccionFormClient1").prop('checked', true);

    // Aquí empieza
    $( "#btnBack" ).trigger( "click" );
    $("button.next-to-domicilio").parent().addClass('d-none');// Se esconde el botón de siguiente para visualizar la vista de domiciliod
    $("div.domicilio-tab").addClass('d-none');
}