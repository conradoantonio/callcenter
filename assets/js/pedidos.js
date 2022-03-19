//#region Variable de Elementos

let comboArticulos = $('#capacidadFormProductos');
let btnAddArticles = $('#guardarProductosForm');
let txtZonaPrecios = $('#zonaPrecioCliente');
let txtCantidad = $('#cantidadFormProductos');
let flagArticuloEm = $('#envaseFormProductos');
let txtValorSinIva = $('#valorFormProductos');
let txtValorConIva = $('#totalFormProductos');
let btnGuardarPedido = $('#guardarPedido')

//#endregion



//#region Variables de objetos

let articulos = [];
let items = [];
let opportunities = [];
let articulosGrid = [];

//#endregion



//#region ciclo de vida de ejecucion
$(document).ready(function () {
    // Funcion para obtener los articulos
    // getArticulos();

    onClickAddProducto();

    // onChangeValue();

    savePedido();
});
//#endregion

$( "input#litrosFormProductos, input#cantidadFormProductos, input#totalFormProductos" ).on('change keyup paste', function(e) {
    onChangeValue( $(this) );
});

$('select#productoFormProductos, select#capacidadFormProductos').on('change', function(e) {
    onChangeValue( $(this) );
});

// 
$('select#productoFormProductos').on('change', function(e) {
    let val = $(this).val();
    if ( val == "cilindro" ) {
        $("#totalFormProductos").prop('readonly', true);
        $(".cilindroFormProductos").removeClass("d-none");
        $(".estacionarioFormProductos").addClass("d-none");
        // $(".opt-pro-pedido-cilindro").attr("disabled", false);
    } else if ( val == "estacionario" ) {
        $("#totalFormProductos").attr('readonly', false);
        $(".estacionarioFormProductos").removeClass("d-none");
        $(".cilindroFormProductos").addClass("d-none");
        // $(".opt-pro-pedido-estacionario").attr("disabled", false);
    } else {
        $("#totalFormProductos").prop('readonly', true);
        $(".estacionarioFormProductos, .cilindroFormProductos").addClass("d-none");
        // $(".opt-pro-pedido-cilindro, .opt-pro-pedido-estacionario").attr("disabled", true);
    }
});


// Valida la información que se mostrará en el modal
$("#agregarProducto").click(function () {
    let direccion = $('select#direccionCliente').children('option:selected').data('address');

    $('.cilindroFormProductos').addClass('d-none');
    $('.estacionarioFormProductos').addClass('d-none');

    $("#envaseFormProductos").prop("checked", false);
    $("#cantidadFormProductos, #litrosFormProductos, #valorFormProductos, #totalFormProductos").val(0);
    $("#productoFormProductos").val("");
    $(".opt-pro-pedido-cilindro, .opt-pro-pedido-estacionario").prop("disabled", false);
    $("#totalFormProductos").prop('readonly', true);

    if ( direccion ) {
        if ( direccion.typeServiceId == 1 ) {// Cilindro
            $("#productoFormProductos").val("cilindro");
            $("#totalFormProductos").prop('readonly', true);
            $(".cilindroFormProductos").removeClass("d-none");
            $(".estacionarioFormProductos").addClass("d-none");
        } else if ( direccion.typeServiceId == 2 ) {// Estacionario
            $("#productoFormProductos").val("estacionario");
            $("#totalFormProductos").attr('readonly', false);
            $(".estacionarioFormProductos").removeClass("d-none");
            $(".cilindroFormProductos").addClass("d-none");
        } else if ( direccion.typeServiceId == 4 ) {// Ambos
            
        }
    }

    // Se validan los option disponibles si es que algún producto ya fue registrado
    if (! $('table.productosEstacionarioPedido').parent().parent().hasClass('d-none') ) {// Ya se agregó gas LP
        $(".opt-pro-pedido-cilindro").attr("disabled", true);
    } else if (! $('table.productosCilindroPedido').parent().parent().hasClass('d-none') ) {// Ya se agregó un cilindro
        $(".opt-pro-pedido-estacionario").attr("disabled", true);
    } else {
        // $(".opt-pro-pedido-cilindro, .opt-pro-pedido-estacionario").attr("disabled", false);
    }

    $("#envaseFormProductos").prop("checked", false);
    $('#formProductosModal').modal('show');
});

// Abre el modal de métodos de pago
$("#agregarMetodoPago").click(function () {
    $('#formMetodoPagosModal').modal('show');
});

// Valida los inputs disponibles en los métodos de pago
$("#metodoPagoPedido").change(function () {
    let metodoId = $(this).val();
    if ( ["8", "2", "5", "6"].includes( metodoId ) ) {// Si el método de pago es transferencia, prepago, tarjeta de crédito, tarjeta de débito
        $("#folioAutorizacionPedido").parent().parent().removeClass("d-none");
    } else {
        $("#folioAutorizacionPedido").parent().parent().addClass("d-none");
    }
});

// Agrega un método de pago nuevo
$('#guardarMetodoPagoForm').on('click', function () {
    let canContinue = false;
    let conFolio    = ["8", "2", "5", "6"];
    let metodoId    = $("#metodoPagoPedido").val();
    // let numMetodos  = $('table.productosMetodoPago tbody').children('tr.metodos').length;

    if(!metodoId || !$("#montoPagoPedido").val() ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if(! canContinue ) { 
        alert("Favor de llenar todos los campos con *");
        return; 
    }

    $('#sinMetodosPago').addClass('d-none');
    $('.productosMetodoPago').parent().parent().removeClass('d-none');

    let total        = parseFloat($('#montoPagoPedido').val()).toFixed(2);
    let folio        = $('#folioAutorizacionPedido').val().trim();
    let metodoNombre = $("#metodoPagoPedido").children(':selected').text();
    let metodoObj    = {
        tipo_pago : metodoId,
        monto     : total,
        folio     : folio,
    };
   
    // Se llena la información del item
    $(".productosMetodoPago tbody").append(
        '<tr data-item-id='+metodoId+' class="metodo-item" data-item=' + "'" + JSON.stringify(metodoObj) + "'" + '>' +
            '<td>'+metodoNombre+'</td>'+
            '<td class="text-center">'+(folio ? folio : 'No aplica')+'</td>'+
            '<td class="text-center" data-total='+total+'>$'+total+' mxn</td>'+
            '<td class="text-center">'+
                '<button class="btn btn-sm btn-danger delete-metodo-pago" data-table-ref=".productosMetodoPago" data-item-id='+metodoId+'> <i class="fa-solid fa-trash-can"></i> </button>'+
            '</td>'+
        '</tr>'
    );

    // Falta código para setear un total
    setTotalMetodoPago( $(".productosMetodoPago") );
    $('#formMetodoPagosModal').modal('hide');

});

// Cuando el select de estados cambie, manda a llamar la petición de obtener ciudades

async function onClickAddProducto() {
    btnAddArticles.on('click', function () {
        let tipoProducto = $('#productoFormProductos').val();
        let canContinue = false;
        let defaultProMsg = $('#sinProductos');
        let prices = $('#zonaPrecioCliente').text().replace('$', '');

        if ( tipoProducto == 'cilindro' ) {
            if( !$("#capacidadFormProductos").val() || $("#cantidadFormProductos").val() <= 0  || $("#valorFormProductos").val() <= 0 || $("#totalFormProductos").val() <= 0 ) {
                canContinue = false;
            } else {
                canContinue = true;
            }
        } else if ( tipoProducto == 'estacionario' ) {
            if( $("#litrosFormProductos").val() <= 0 || $("#valorFormProductos").val() <= 0  || $("#totalFormProductos").val() <= 0) {
                canContinue = false;
            } else {
                canContinue = true;
            }
        }

        if (! canContinue ) {
            alert("Favor de llenar todos los campos con *");
            return;
        }
        // Se remueve el mensaje principal de que no hay productos
        defaultProMsg.addClass('d-none');

        let itemId   = ( tipoProducto == 'cilindro' ? $( '#capacidadFormProductos' ).val() : 4088 );
        let searchTr = $('tr[data-item-id="'+itemId+'"]');

        // Se agrega el artículo a la tabla
        if ( tipoProducto == 'cilindro' ) {// Cilindro

            $('.productosCilindroPedido').parent().parent().removeClass('d-none');
            
            let total     = parseFloat($('#totalFormProductos').val());
            let artSel    = $( '#capacidadFormProductos' ).children('option:selected').data('articulo');
            let capacidad = parseInt( ( artSel && artSel.capacidad_litros ? artSel.capacidad_litros : 0 ) );
            // let capacidad = parseInt( $('#cantidadFormProductos').val() );
            let envase    = $('#envaseFormProductos').is(':checked');
            let articulo  = {
                "zoneprice" : prices,// Este es el valor de la zona
                "capacity"  : capacidad,
                "quantity"  : $( '#cantidadFormProductos' ).val(),
                "article"   : $( '#capacidadFormProductos' ).val()
            };
            
            if ( searchTr.length ) {// Se verifica si el artículo fue previamente registrado

                let firstItem         = searchTr.data('item');
                let firstTotal        = parseFloat( searchTr.children('td').siblings("td:nth-child(4)").data('total') ).toFixed(2);
                firstItem['quantity'] = parseInt( Number(firstItem['quantity']) + Number(articulo['quantity']));

                total = parseFloat(Number(total) + Number(firstTotal)).toFixed(2);
                searchTr.data('item', firstItem);
                searchTr.children('td').siblings("td:nth-child(2)").text(firstItem['quantity']);
                searchTr.children('td').siblings("td:nth-child(4)").data('total', total);
                searchTr.children('td').siblings("td:nth-child(4)").text('$'+total+' mxn');
                console.log(firstItem);
                
            } else {

                // Se llena la información del item
                $(".productosCilindroPedido tbody").append(
                    '<tr data-item-id='+articulo.article+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
                        '<td class="text-center">'+(artSel && artSel.nombre ? artSel.nombre : 'Sin nombre asignado')+'</td>'+
                        '<td class="text-center">'+articulo['quantity']+'</td>'+
                        '<td class="text-center">'+capacidad+' kg</td>'+
                        '<td class="text-center" data-total='+total+'>$'+total+' mxn</td>'+
                        '<td class="text-center">'+(envase ? 'Si' : 'No')+'</td>'+
                        '<td class="text-center">'+
                            '<button class="btn btn-sm btn-info edit-producto-cil"> <i class="fa fa-pen-to-square"></i> </button> '+
                            '<button class="btn btn-sm btn-danger delete-producto-cil" data-table-ref=".productosCilindroPedido" data-item-id='+articulo.article+'> <i class="fa-solid fa-trash-can"></i> </button>'+
                        '</td>'+
                    '</tr>'
                );

            }

            setTotalPedido( $(".productosCilindroPedido") );

        } else if ( tipoProducto == 'estacionario' ) {// Estacionario

            $('.productosEstacionarioPedido').parent().parent().removeClass('d-none');
            
            let total  = parseFloat($('#totalFormProductos').val());
            let litros = parseInt($("#litrosFormProductos").val());
            let articulo = {
                "zoneprice" : prices,// Este es el valor de la zona
                "capacity"  : litros,
                "quantity"  : 1,
                "article"   : 4088// ID de GAS LP
            };

            if ( searchTr.length ) {// Se verifica si el artículo fue previamente registrado
                let firstItem         = searchTr.data('item');
                let firstTotal        = parseFloat( searchTr.children('td').siblings("td:nth-child(4)").data('total') ).toFixed(2);
                firstItem['capacity'] = firstItem['capacity'] + articulo['capacity'];

                total = parseFloat(Number(total) + Number(firstTotal)).toFixed(2);
                searchTr.data('item', firstItem);
                searchTr.children('td').siblings("td:nth-child(2)").text(firstItem['capacity']);
                searchTr.children('td').siblings("td:nth-child(4)").data('total', total);
                searchTr.children('td').siblings("td:nth-child(4)").text('$'+total+' mxn');
                console.log(firstItem);
            } else {// Se llena la información del item
                
                $(".productosEstacionarioPedido tbody").append(
                    '<tr data-item-id='+articulo.article+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
                        '<td>Gas LP</td>'+
                        '<td class="text-center">'+$("#litrosFormProductos").val()+'</td>'+
                        '<td class="text-center">1</td>'+
                        '<td class="text-center" data-total='+total+'>$'+total+' mxn</td>'+
                        '<td class="text-center">'+
                            '<button class="btn btn-sm btn-info edit-producto-est"> <i class="fa fa-pen-to-square"></i> </button> '+
                            '<button class="btn btn-sm btn-danger delete-producto-est" data-table-ref=".productosEstacionarioPedido" data-item-id='+articulo.article+'> <i class="fa-solid fa-trash-can"></i> </button>'+
                        '</td>'+
                    '</tr>'
                );

            }

            setTotalPedido( $(".productosEstacionarioPedido") );

        }

        // Desvanece el modal
        $('#formProductosModal').modal('hide');
    });
}

// Método para calcular los campos valor y total acorde al tipo de producto.
function onChangeValue(element) {
    var elementId    = element.attr('id');
    let subtotal     = total = 0;
    let tipoProducto = $('#productoFormProductos').val();
    let prices       = $('#zonaPrecioCliente').text().replace('$', '');
    let cantidad     = parseInt( $('#cantidadFormProductos').val() );
    let litros       = parseInt( $('#litrosFormProductos').val() );
    let valor        = parseFloat( $('#valorFormProductos').val() ).toFixed(2);
    let articulo     = $('#capacidadFormProductos').children(':selected').data('articulo');
    // console.log(articulo);
    let capArticulo  = ( articulo && articulo.capacidad_litros ? articulo.capacidad_litros : 0 );
    
    cantidad = ( isNaN(cantidad) ? 0 : cantidad );
    litros   = ( isNaN(litros) ? 0 : litros );
    valor    = ( isNaN(valor) ? 0 : valor );

    if ( tipoProducto == 'cilindro' ) {// Cilindro
        if ( elementId == 'cantidadFormProductos' || elementId == 'capacidadFormProductos' ) {

            subtotal = Math.ceil( capArticulo *  cantidad * prices);
            $('#valorFormProductos').val(subtotal);

        }

        total = Math.ceil(subtotal * 1.16);
        $('#totalFormProductos').val(total);
        
    } else if ( tipoProducto == 'estacionario' ) {// Estacionario
        if ( elementId == 'totalFormProductos' ) {// Se calculan los litros a contratar

            total = parseFloat( $('#totalFormProductos').val() ).toFixed(2);
            total = ( isNaN(total) ? 0 : total );
            subtotal = parseFloat(total / 1.16).toFixed(2);
            // subtotal = Math.ceil( $('#valorFormProductos').val() );
            // subtotal = ( isNaN(subtotal) ? 0 : subtotal );
            litros = Math.ceil(subtotal / prices);
            $('#litrosFormProductos').val(litros);

        } else if( elementId == 'litrosFormProductos' ) {// Se calcula el total acorde a los litros

            subtotal = parseInt(litros * prices); 
            total = Math.ceil(subtotal * 1.16);
            $('#totalFormProductos').val(total);
            
        }

        $('#valorFormProductos').val(subtotal);
    
    } else {// Todo se coloca en 0
        
    }
}

// Guarda la información de un pedido
async function savePedido() {
    btnGuardarPedido.on('click', function () {

        let totalPedido = 0;
        let totalMetodosPago = 0;

        if (! $('.productosEstacionarioPedido').parent().parent().hasClass('d-none') ) {// Estacionario
            totalPedido = $('.productosEstacionarioPedido').children('tfoot').find('td.total').data('total');
        } else if (! $('.productosCilindroPedido').parent().parent().hasClass('d-none') ) {// Cilindro
            totalPedido = $('.productosCilindroPedido').children('tfoot').find('td.total').data('total');
        }
        
        let canContinue = false;
        if(
            //!$("#cadaFormCliente").val().trim()                         ||
            //!$("#frecuenciaFormCliente").val().trim()                   ||
            //!$("#entreFormCliente").val().trim()                        ||
            //!$("#lasFormCliente").val().trim()                          ||
            $('table.productosMetodoPago tbody').find("tr.metodo").length == 0
        ) {
            canContinue = false;
        } else {
            canContinue = true;
        }

        if (! canContinue ) {
            
            $('.productosCilindroPedido').children('tfoot').find('td.total').data('total');
            $('.productosEstacionarioPedido').children('tfoot').find('td.total').data('total');
            return; 
        }

        let articulosArr = [];
        let pagosArr     = [{"tipo_pago":"1","monto":464}];

        if (! $('table.productosEstacionarioPedido').parent().parent().hasClass('d-none') ) {
            $('table.productosEstacionarioPedido > tbody  > tr.product-item').each(function() {
                articulosArr.push( $( this ).data('item') );
            });
        } else if (! $('table.productosCilindroPedido').parent().parent().hasClass('d-none') ) {
            $('table.productosCilindroPedido > tbody  > tr.product-item').each(function() {
                articulosArr.push( $( this ).data('item') );
            });
        }

        console.log(articulosArr);

        let direccionSel = $('#direccionCliente').children(':selected').data('address');
        let typeService  = '';
        let statusOpp    = '';
        $('.productosCilindroPedido').is(':visible') ? typeService = 1 : '';
        $('.productosEstacionarioPedido').is(':visible') ? typeService = 2 : '';

        if( direccionSel.typeContact  == 1 ) { statusOpp = 6; }// Teléfono
        if( direccionSel.typeContact  == 2 ) { statusOpp = 6; }// Aviso
        if( direccionSel.typeContact  == 4 ) { statusOpp = 1; }// Programado

        let tmp = {
            "status"        : 11,
            // "numero_viaje"  : "",
            "zona_precio"   : 2,//Este es el Id de la zona
            "customer"      : $('#idCliente').text(),
            "idAddressShip" : $('#direccionCliente').val(),
            "statusOpp"     : statusOpp,
            "operario"      : userId,
            "typeservice"   : typeService,
            "time"          : "12:00 pm",
            "turn"          : 1,
            "paymentMethod" : $('#metodoPagoPedido').val(),
            "origen"        : $('#idCliente').val(),
            "comentary"     : $('#observacionesPagoPedido').val(),
            "rangeHour1"    : formatTime( $('#desdePedido').val() ),
            "rangeHour2"    : formatTime( $('#hastaPedido').val() ),
            "folio"         : "",
            "tipo"          : typeService,
            "items"         : articulosArr,
            "pago"          : pagosArr,
        }

        opportunities.push(tmp);

        // console.log('Guardar pedido', { opportunities: opportunities });

        let settings = {
            url    : urlCrearPedido,
            method : 'POST',
            data   : JSON.stringify({ opportunities: opportunities }),
        }

        loadMsg('Guardando información...');

        setAjax(settings).then((response) => {
            infoMsg('success', 'Pedido', 'El pedido se a creado de manera correcta', 2000)
            console.log('Pedido creado exitósamente', response);
            opportunities = [];
            clearFields();
        }).catch((error) => {
            infoMsg('error', 'El pedido no ha sido creado', 'Verifique que la información sea correcta');
            // Limpia los campos de cliente
            
            console.log(error);
        });
    });
}

async function clearFields() {
    // $('#fechaPrometidaPedido').val('');
    $('#desdePedido, #hastaPedido, #observacionesPagoPedido').val('');

    $("#sinProductos").removeClass("d-none");
    
    $("table.productosCilindroPedido").parent().parent().addClass("d-none");
    $("table.productosCilindroPedido").children('tbody').children('tr').remove();
    $("table.productosEstacionarioPedido").parent().parent().addClass("d-none");
    $("table.productosEstacionarioPedido").children('tbody').children('tr').remove();
    // $("#productosCilindroPedido").find(".content").remove();
}
//#endregion

//Send a request for a single delete
$('body').delegate('.delete-producto-cil, .delete-producto-est','click', function() {
    let item  = $(this).parent().parent().data('item');
    let table = $(this).data('table-ref');
    let id    = ( item && item.article ? item.article : 0 );

    swal({
        title: 'Se dará de baja el producto seleccionado, ¿Está seguro de continuar?',
        icon: 'warning',
        buttons:["Cancelar", "Aceptar"],
        dangerMode: true,
    }).then((accept) => {
        if ( accept ){
            $('tr[data-item-id="'+id+'"]').remove();
            validarTablaProductos( $(table) );
        }
    }).catch(swal.noop);
});

// Valida la información mostrada en la lista de pedidos
function validarTablaProductos(table) {
    if (! table.children('tbody').children('tr.product-item').length ) {
        table.parent().parent().addClass('d-none');
        $('#sinProductos').removeClass('d-none');
    }

    setTotalPedido(table);
}

// Calcula el total de los productos
function setTotalPedido(table) {
    let total = parseFloat(0).toFixed(2);

    table.children('tbody').children('tr.product-item').each(function() {
        // let articulo = $( this ).data('item');
        let subtotal = parseFloat($( this ).children('td').siblings("td:nth-child(4)").data('total')).toFixed(2);
        total = Number(total) + Number(subtotal);
    });

    table.children('tfoot').find('td.total').data('total', parseFloat(total).toFixed(2));
    table.children('tfoot').find('td.total').text('$'+total+' mxn');
}

// Calcula el total del método de pago
function setTotalMetodoPago(table) {
    let total = parseFloat(0).toFixed(2);

    table.children('tbody').children('tr.metodo-item').each(function() {
        // let articulo = $( this ).data('item');
        let subtotal = parseFloat($( this ).children('td').siblings("td:nth-child(3)").data('total')).toFixed(2);
        total = Number(total) + Number(subtotal);
    });

    table.children('tfoot').find('td.total').data('total', parseFloat(total).toFixed(2));
    table.children('tfoot').find('td.total').text('$'+total+' mxn');
}

// Método que ejecuta la cancelación de un pedido
$("#guardarCancelarOpp").click(function () {
    let canContinue = false;
    if( !$("#cancelarOppObservaciones").val().trim() ||  !$("#cancelarOppMotivo").val().trim() ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if (! canContinue ) {
        
        alert("Favor de llenar todos los campos con *");

        return; 
    }

    swal({
        title: '¿Está seguro de cancelar este registro?',
        icon: 'warning',
        buttons:["Cancelar", "Aceptar"],
        dangerMode: true,
    }).then((accept) => {
        if ( accept ) {
            searchCustomer( buscar );
        }
    }).catch(swal.noop);
});

//#region Servicios

// funcion para generar las peticiones
function requests(url, method, data) {
    // Generamos el AJAX dinamico para las peticiones relacionadas con peddos
    return new Promise((resolve, reject) => {
        $.ajax({
            url: url,
            method: method,
            data: JSON.stringify(data),
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) {
                resolve(data);
            }, error: function (xhr, status, error) {
                reject({ xhr: xhr, status: status, error: error });
            }
        });
    });
}

//#endregion