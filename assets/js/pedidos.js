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

$('body').delegate('input.check-opp-caso','change', function() {
    $('div[class*="drop-options"]').addClass('d-none');
    if( this.checked ) {
        $('.check-opp-caso').prop('checked', false);
        $(this).prop('checked', true);
        $('.drop-options-'+this.id).removeClass('d-none');
        // console.log('está chequeado');
    } else {
        // console.log('no está chequeado');
    }
});
//#endregion

$( "input#litrosFormProductos, input#cantidadFormProductos, input#totalFormProductos" ).on('change keyup paste', function(e) {
    onChangeValue( $(this) );
});

$('select#productoFormProductos, select#capacidadFormProductos').on('change', function(e) {
    onChangeValue( $(this) );
});

// Valida la información mostrada en el modal del producto
$('select#productoFormProductos').on('change', function(e) {
    let val = $(this).val();
    $('.info-minimo-gas-lp').addClass('d-none');
    if ( val == "cilindro" ) {
        $("#totalFormProductos").prop('readonly', true);
        $(".cilindroFormProductos").removeClass("d-none");
        $(".estacionarioFormProductos").addClass("d-none");
        // $(".opt-pro-pedido-cilindro").attr("disabled", false);
    } else if ( val == "estacionario" ) {
        $('.info-minimo-gas-lp').removeClass('d-none');
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
    let direccion   = $('select#direccionCliente').children('option:selected').data('address');
    let minimoGasLp = Number($('select#plantas').children(':selected').data('pedido-minimo'));
    $('.minimo-gas-lp').text(minimoGasLp);

    console.log(direccion);
    
    if ( direccion ) {
        let item1Id        = Number(parseInt(direccion.item1Id));
        let item1Capacidad = Number(parseInt(direccion.item1Capacidad));

        if ( direccion.typeServiceId == 1 ) {// Cilindro
            $("#productoFormProductos").val("cilindro");
            $("#totalFormProductos").prop('readonly', true);
            $(".cilindroFormProductos").removeClass("d-none");
            $(".estacionarioFormProductos").addClass("d-none");
            // Se realiza el cálculo del total
            $('#cantidadFormProductos').val(item1Capacidad);
            $('#capacidadFormProductos').val(item1Id);
            onChangeValue( $('input#cantidadFormProductos') );
        } else if ( direccion.typeServiceId == 2 ) {// Estacionario
            $('.info-minimo-gas-lp').removeClass('d-none');
            $("#productoFormProductos").val("estacionario");
            $("#totalFormProductos").attr('readonly', false);
            $(".estacionarioFormProductos").removeClass("d-none");
            $(".cilindroFormProductos").addClass("d-none");
            // Se realiza el cálculo del total
            $('#litrosFormProductos').val(item1Capacidad);
            onChangeValue( $('input#litrosFormProductos') );
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

// Edita un producto agregado en la lista del pedido
$('body').delegate('.edit-producto-cil, .edit-producto-est','click', function() {
    let button   = $(this);
    let lblPrice = 'Precio x kg';
    let prices   = $('#zonaPrecioCliente').data("price");
    let artObj   = button.parent().parent().data('item');
    let total    = 0;
    let subtotal = 0;
    // let direccion = $('select#direccionCliente').children('option:selected').data('address');
    
    if ( button.hasClass('edit-producto-cil') ) {// Producto cilindro
        if(!isPriceKG) {
            prices = prices / 0.54;
        }
        lblPrice = 'Precio x kg ';
        $('.precio-unitario-label').html(lblPrice);
        $("#formProductosModalPrecio").html('$'.concat(Number(prices).toFixed(4)));
        $("#productoFormProductos").val("cilindro");
        $("#totalFormProductos").prop('readonly', true);
        $(".cilindroFormProductos").removeClass("d-none");
        $(".estacionarioFormProductos").addClass("d-none");

        subtotal = parseFloat( Number(artObj.capacity) *  Number(artObj.quantity) * Number(prices)).toFixed(4);
        total    = parseFloat( Number(subtotal) * 1.16 ).toFixed(4);

        $('#capacidadFormProductos, #pedidoProductoId').val(artObj.article);
        $('#cantidadFormProductos').val(artObj.quantity);
        $('#valorFormProductos').val(subtotal);
        $('#totalFormProductos').val(total);        
    } else if ( button.hasClass('edit-producto-est') ) {// Producto estacionario
        if(isPriceKG) {
            prices = prices * 0.54;
        }
        lblPrice = 'Precio x litro ';
        $('.precio-unitario-label').html(lblPrice);
        $("#formProductosModalPrecio").html('$'.concat(Number(prices).toFixed(4)));
        $("#productoFormProductos").val("estacionario");
        $("#totalFormProductos").attr('readonly', false);
        $(".estacionarioFormProductos").removeClass("d-none");
        $(".cilindroFormProductos").addClass("d-none");

        subtotal = parseFloat( Number(artObj.capacity) * Number(prices) ).toFixed(4);
        total    = parseFloat( Number(subtotal) * 1.16 ).toFixed(4);

        $("#pedidoProductoId").val( artObj.article );// Este input indicará que se trata de un edit
        $("#litrosFormProductos").val( artObj.capacity );
        $("#valorFormProductos").val( subtotal );
        $("#totalFormProductos").val( total );        
    }

    // Se validan los option disponibles si es que algún producto ya fue registrado
    if (! $('table.productosEstacionarioPedido').parent().parent().hasClass('d-none') ) {// Ya se agregó gas LP
        $(".opt-pro-pedido-cilindro").attr("disabled", true);
    } else if (! $('table.productosCilindroPedido').parent().parent().hasClass('d-none') ) {// Ya se agregó un cilindro
        $(".opt-pro-pedido-estacionario").attr("disabled", true);
    } else {
        // $(".opt-pro-pedido-cilindro, .opt-pro-pedido-estacionario").attr("disabled", false);
    }

    $('#formProductosModal').modal('show');
});

// Abre el modal de métodos de pago
$("#agregarMetodoPago").click(function () {
    if($("#sinProductos").is(':hidden')) {
        let totalProducto = 0;
        let totalMetodosPago = 0;
        let montoRestante = 0;
        // Calcula el total del pedido basándose en los productos agregados al listado
        if (! $('.productosEstacionarioPedido').parent().parent().hasClass('d-none') ) {// Estacionario
            totalProducto = $('.productosEstacionarioPedido').children('tfoot').find('td.total').data('total');
        } else if (! $('.productosCilindroPedido').parent().parent().hasClass('d-none') ) {// Cilindro
            totalProducto = $('.productosCilindroPedido').children('tfoot').find('td.total').data('total');
        }

        // Calcula el total de método de pago basándose en los especificados en la lista
        if (! $('.productosMetodoPago').parent().parent().hasClass('d-none') ) {// Contiene métodos
            totalMetodosPago = $('.productosMetodoPago').children('tfoot').find('td.total').data('total');
        }

        montoRestante = parseFloat( Number(totalProducto) - Number(totalMetodosPago) ).toFixed(4);
        montoRestante = montoRestante > 0 ? montoRestante : 0;

        $('#montoPagoPedido').val(montoRestante);

        /* Muestra metodos correctos */
        let options = $("#metodoPagoPedido").children("option");
        options.addClass("d-none");
        $("#metodoPagoPedido").children("option[value=0]").removeClass("d-none");
        let isEstacionario = $(".productosCilindroPedido").is(':hidden');
        if(isEstacionario) {
            for (let x = 0; x < options.length; x++) {
                const element = options[x];
                if(methodsEstacionario.indexOf($(element).val()) > -1) {
                    $(element).removeClass("d-none")
                }
            }
        } else {
            options.removeClass("d-none");
        }

        // Se vuelve a llamar este método únicamente para que valide el método de pago crédito cliente
        setAlianzaComercial(customerGlobal);

        $('#formMetodoPagosModal').modal('show');
    } else {
        infoMsg('warning', 'Alerta:', "Es necesario primero agregar un producto para poder ingresar un metodo de pago");
    }
});

// Valida los inputs disponibles en los métodos de pago
$("#metodoPagoPedido").change(function () {
    let metodoId = parseInt( $(this).val() );
    
    if ( metodosPagoPrepago.includes( metodoId ) || metodoId == metodoTransferencia ) {// Si el método de pago es transferencia, prepago
        $(".campo-prepago").removeClass("d-none");
        getListaCuentas(metodoId);
    } else {
        $(".campo-prepago").addClass("d-none");
    }

    if ( metodoId == metodoTransferencia ) {// Se trata de una transferencia, no debe de mostrar el tipo de tarjeta que es
        $('#tipoTarjeta').parent().parent().addClass('d-none');
    }
});

// Agrega un método de pago nuevo
$('#guardarMetodoPagoForm').on('click', function () {
    let canContinue = false;
    // let conFolio    = ["8", "2", "5", "6"];
    let metodoId    = parseInt( $("#metodoPagoPedido").val() );
    let metodoTxt   = $('#metodoPagoPedido').children(':selected').text();
    let tipoTarjeta = parseInt($("#tipoTarjeta").val());
    let tipoCuenta  = parseInt($("#tipoCuenta").val());
    let folioAut    = $("#folioAutorizacionPedido").val().trim();
    // let numMetodos  = $('table.productosMetodoPago tbody').children('tr.metodos').length;

    if(
        ( !metodoId || metodoId == 0 || !$("#montoPagoPedido").val() ) || 
        ( metodosPagoPrepago.includes(metodoId) && ( !folioAut || !tipoTarjeta || !tipoCuenta ) ) || //Si son de prepago, pide estos campos
        ( metodoId == metodoTransferencia  && ( !folioAut || !tipoCuenta ) ) // Si es transferencia, no pide el tipo de tarjeta
    ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if(! canContinue ) { 
        alert("Favor de llenar todos los campos con *");
        return; 
    }

    // let searchTr = $('table.productosMetodoPago > tbody > tr[data-metodo-id="'+metodoId+'"]');

    $('#sinMetodosPago').addClass('d-none');
    $('.productosMetodoPago').parent().parent().removeClass('d-none');

    let total        = parseFloat($('#montoPagoPedido').val()).toFixed(4);
    let metodoObj    = {
        metodo_txt   : metodoTxt,
        tipo_pago    : metodoId,
        tipo_cuenta  : tipoCuenta,
        tipo_tarjeta : tipoTarjeta,
        monto        : total,
        folio        : folioAut,
    };

    agregarMetodoPago(metodoObj);

    // if ( searchTr.length ) {// Se verifica si el artículo fue previamente registrado y se edita el row

    //     searchTr.data('metodo', metodoObj);
    //     searchTr.children('td').siblings("td:nth-child(2)").text(folio ? folio : 'No aplica');
    //     searchTr.children('td').siblings("td:nth-child(3)").data('total', total);
    //     searchTr.children('td').siblings("td:nth-child(3)").text('$'+total+' mxn');
    //     console.log(metodoObj);
        
    // } else {// Se llena la información del item
        
    //     $(".productosMetodoPago tbody").append(
    //         '<tr data-metodo-id='+metodoId+' class="metodo-item" data-metodo=' + "'" + JSON.stringify(metodoObj) + "'" + '>' +
    //             '<td>'+metodoNombre+'</td>'+
    //             '<td class="text-center">'+(folio ? folio : 'No aplica')+'</td>'+
    //             '<td class="text-center" data-total='+total+'>$'+total+' mxn</td>'+
    //             '<td class="text-center">'+
    //                 '<button class="btn btn-sm btn-danger delete-metodo-pago" data-table-ref=".productosMetodoPago" data-metodo-id='+metodoId+'> <i class="fa-solid fa-trash-can"></i> </button>'+
    //             '</td>'+
    //         '</tr>'
    //     );

    // }
   
    // Falta código para setear un total
    setTotalMetodoPago( $(".productosMetodoPago") );
    $('#formMetodoPagosModal').modal('hide');

});

// Cuando el select de estados cambie, manda a llamar la petición de obtener ciudades

async function onClickAddProducto() {
    btnAddArticles.on('click', function () {
        let tipoProducto = $('#productoFormProductos').val();
        let canContinue = false;
        let productoId  = $('#pedidoProductoId').val();
        let defaultProMsg = $('#sinProductos');
        let prices = $('#zonaPrecioCliente').data("price");

        if ( tipoProducto == 'cilindro' ) {
            if( !$("#capacidadFormProductos").val() || $("#cantidadFormProductos").val() <= 0  || $("#valorFormProductos").val() <= 0 || $("#totalFormProductos").val() <= 0 ) {
                canContinue = false;
            } else {
                canContinue = true;
            }
            if(!isPriceKG) {
                prices = prices / 0.54;
            }
        } else if ( tipoProducto == 'estacionario' ) {
            if( $("#litrosFormProductos").val() <= 0 || $("#valorFormProductos").val() <= 0  || $("#totalFormProductos").val() <= 0) {
                canContinue = false;
            } else {
                canContinue = true;
            }
            if(isPriceKG) {
                prices = prices * 0.54;
            }
        }

        if (! canContinue ) {
            alert("Favor de llenar todos los campos con *");
            return;
        }
        // Se remueve el mensaje principal de que no hay productos
        defaultProMsg.addClass('d-none');

        let itemId   = ( tipoProducto == 'cilindro' ? $( '#capacidadFormProductos' ).val() : articuloGasLp );
        let searchTr = $('tr[data-item-id="'+itemId+'"]');

        // Se agrega el artículo a la tabla
        if ( tipoProducto == 'cilindro' ) {// Cilindro

            $('.productosCilindroPedido').parent().parent().removeClass('d-none');
            
            let total     = parseFloat($('#totalFormProductos').val()).toFixed(4);
            let artSel    = $( '#capacidadFormProductos' ).children('option:selected').data('articulo');
            let capacidad = parseInt( ( artSel && artSel.capacidad_litros ? artSel.capacidad_litros : 0 ) );
            let envase    = $('#envaseFormProductos').is(':checked');
            let articulo  = {
                "zoneprice" : prices,// Este es el valor de la zona
                "tipo"      : 1,
                "capacity"  : capacidad,
                "quantity"  : $( '#cantidadFormProductos' ).val(),
                "article"   : $( '#capacidadFormProductos' ).val()
            };

            agregarEnvase(envase, $(".productosCilindroPedido"), artSel, prices);
            
            if ( searchTr.length ) {// Se verifica si el artículo fue previamente registrado

                if ( productoId ) {// Si es una edición, se reemplazará todo el contenido
                    searchTr.data('item', articulo);
                    // searchTr.data('item-id', articulo.article);
                    searchTr.children('td').siblings("td:nth-child(1)").text(artSel && artSel.nombre ? artSel.nombre : 'Sin nombre asignado');
                    searchTr.children('td').siblings("td:nth-child(2)").text(articulo['quantity']);
                    searchTr.children('td').siblings("td:nth-child(3)").text(capacidad+' kg');
                    searchTr.children('td').siblings("td:nth-child(4)").data('total', total);
                    searchTr.children('td').siblings("td:nth-child(4)").text('$'+total+' MXN');
                    // searchTr.children('td').siblings("td:nth-child(4)").children('button.delete-producto-cil').data('item-id', articulo.article);
                } else {
                    let firstItem         = searchTr.data('item');
                    let firstTotal        = parseFloat( searchTr.children('td').siblings("td:nth-child(4)").data('total') ).toFixed(4);
                    firstItem['quantity'] = parseInt( Number(firstItem['quantity']) + Number(articulo['quantity']));
    
                    total = parseFloat(Number(total) + Number(firstTotal)).toFixed(4);
                    searchTr.data('item', firstItem);
                    searchTr.children('td').siblings("td:nth-child(2)").text(firstItem['quantity']);
                    searchTr.children('td').siblings("td:nth-child(4)").data('total', total);
                    searchTr.children('td').siblings("td:nth-child(4)").text('$'+total+' MXN');
                    console.log(firstItem);
                }
                
            } else {

                // Se llena la información del item
                $(".productosCilindroPedido tbody").append(
                    '<tr data-item-id='+articulo.article+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
                        '<td class="text-center">'+(artSel && artSel.nombre ? artSel.nombre : 'Sin nombre asignado')+'</td>'+
                        '<td class="text-center">'+articulo['quantity']+'</td>'+
                        '<td class="text-center">'+capacidad+' kg</td>'+
                        '<td class="text-center" data-total='+total+'>$'+total+' MXN</td>'+
                        // '<td class="text-center">'+(envase ? 'Si' : 'No')+'</td>'+
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
            
            let total  = parseFloat( $('#totalFormProductos').val() ).toFixed(4);
            let litros = parseInt( $("#litrosFormProductos").val() );
            let articulo = {
                "zoneprice" : prices,// Este es el valor de la zona
                "tipo"      : 2,
                "capacity"  : litros,
                "quantity"  : 1,
                "article"   : articuloGasLp// ID de GAS LP
            };

            if ( searchTr.length ) {// Se verifica si el artículo fue previamente registrado
                
                if ( productoId ) {// Si es una edición, se reemplazará todo el contenido
                    searchTr.data('item', articulo);
                    searchTr.children('td').siblings("td:nth-child(3)").text(articulo['capacity']);
                    searchTr.children('td').siblings("td:nth-child(4)").data('total', total);
                    searchTr.children('td').siblings("td:nth-child(4)").text('$'+total+' MXN');
                } else {// Se suma el consumo del cliente
                    let firstItem         = searchTr.data('item');
                    let firstTotal        = parseFloat( searchTr.children('td').siblings("td:nth-child(4)").data('total') ).toFixed(4);
                    firstItem['capacity'] = firstItem['capacity'] + articulo['capacity'];
    
                    total = parseFloat(Number(total) + Number(firstTotal)).toFixed(4);
                    searchTr.data('item', firstItem);
                    searchTr.children('td').siblings("td:nth-child(3)").text(firstItem['capacity']);
                    searchTr.children('td').siblings("td:nth-child(4)").data('total', total);
                    searchTr.children('td').siblings("td:nth-child(4)").text('$'+total+' MXN');
                    console.log(firstItem);
                }

            } else {// Se llena la información del item
                
                $(".productosEstacionarioPedido tbody").append(
                    '<tr data-item-id='+articulo.article+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
                        '<td>Gas LP</td>'+
                        '<td class="text-center">1</td>'+
                        '<td class="text-center">'+$("#litrosFormProductos").val()+'</td>'+
                        '<td class="text-center" data-total='+total+'>$'+total+' MXN</td>'+
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

// Agrega el envase seleccionado de un cilindro
function agregarEnvase(conEnvase, table, cilindro, zonaVenta) {
    if (! conEnvase ) { return; }// Sólo si tiene envase valida el proceso

    let artEnvase = null; 

    // Si el tipo de artículo es envase y coincide con la capacidad del artículo seleccionado
    for (let i = 0; i < articulosArr.length; i++) {
        if ( articulosArr[i].tipo_articulo == 5 && articulosArr[i].capacidad_litros == cilindro.capacidad_litros ) {
            artEnvase = articulosArr[i];
        }
        
    }
    
    if (! artEnvase ) { return; }// No encontró el envase del artículo y no agrega nada

    let searchTr = $('tr[data-item-id="'+artEnvase.id+'"]');
    
    if (! searchTr.length ) {// Se verifica si el artículo fue previamente registrado

        let artObj  = {
            "zoneprice" : zonaVenta,// Este es el valor de la zona
            "tipo"      : 5,
            "precio"    : artEnvase.basePrice,
            "capacity"  : artEnvase.capacidad_litros,
            "quantity"  : 1,
            "article"   : artEnvase.id
        };

        let total = parseFloat( Number(artEnvase.basePrice) * 1.16 ).toFixed(4);

        // Se llena la información del item
        $(table).children("tbody").append(
            '<tr data-item-id='+artEnvase.id+' class="product-item" data-item=' + "'" + JSON.stringify(artObj) + "'" + '>' +
                '<td class="text-center">'+(artEnvase.nombre ? artEnvase.nombre : 'Sin nombre asignado')+'</td>'+
                '<td class="text-center">'+artObj['quantity']+'</td>'+
                '<td class="text-center">'+artObj['capacity']+' kg</td>'+
                '<td class="text-center" data-total='+total+'>$'+total+' MXN</td>'+
                '<td class="text-center">'+
                    // '<button class="btn btn-sm btn-info edit-producto-cil"> <i class="fa fa-pen-to-square"></i> </button> '+
                    '<button class="btn btn-sm btn-danger delete-producto-cil" data-table-ref=".productosCilindroPedido" data-item-id='+artEnvase.id+'> <i class="fa-solid fa-trash-can"></i> </button>'+
                '</td>'+
            '</tr>'
        );
        
    } else {
        
        console.log('El envase ya había sido agregado');

    }
}

// Método para calcular los campos valor y total acorde al tipo de producto.
function onChangeValue(element) {
    var elementId    = element.attr('id');
    let subtotal     = total = 0;
    let lblPrice     = 'Precio x kg';
    let tipoProducto = $('#productoFormProductos').val();
    let prices       = $('#zonaPrecioCliente').data("price");
    let cantidad     = parseInt( $('#cantidadFormProductos').val() );
    let litros       = parseInt( $('#litrosFormProductos').val() );
    let valor        = parseFloat( $('#valorFormProductos').val() ).toFixed(4);
    let articulo     = $('#capacidadFormProductos').children(':selected').data('articulo');
    console.log(articulo);
    let capArticulo  = ( articulo && articulo.capacidad_litros ? articulo.capacidad_litros : 0 );
    
    cantidad = ( isNaN(cantidad) ? 0 : cantidad );
    litros   = ( isNaN(litros) ? 0 : litros );
    valor    = ( isNaN(valor) ? 0 : valor );
    console.log(prices);
    if ( tipoProducto == 'cilindro' ) {// Cilindro
        if(!isPriceKG) {
            prices = prices / 0.54;
        }
        lblPrice = 'Precio x kg ';
        $('.precio-unitario-label').html(lblPrice);
        $("#formProductosModalPrecio").html('$'.concat(Number(prices).toFixed(4)));
        if ( elementId == 'cantidadFormProductos' || elementId == 'capacidadFormProductos' || elementId == 'productoFormProductos' ) {// Producto (cilindro) y cantidad de producto

            subtotal = parseFloat( capArticulo *  cantidad * prices).toFixed(4);
            $('#valorFormProductos').val(subtotal);

        } else if ( elementId == 'cantidadFormProductos' ) {// Se resetea el formulario ¿?

        }

        total = parseFloat(subtotal * 1.16).toFixed(4);
        $('#totalFormProductos').val(total);
        
    } else if ( tipoProducto == 'estacionario' ) {// Estacionario
        if(isPriceKG) {
            prices = prices * 0.54;
        }
        lblPrice = 'Precio x litro ';
        $('.precio-unitario-label').html(lblPrice);
        $("#formProductosModalPrecio").html('$'.concat(Number(prices).toFixed(4)));
        if ( elementId == 'totalFormProductos' || elementId == 'productoFormProductos' ) {// Se calculan los litros a contratar

            total = parseFloat( $('#totalFormProductos').val() ).toFixed(4);
            total = ( isNaN(total) ? 0 : total );
            subtotal = parseFloat(total / 1.16).toFixed(4);
            // subtotal = Math.ceil( $('#valorFormProductos').val() );
            // subtotal = ( isNaN(subtotal) ? 0 : subtotal );
            litros = parseFloat(subtotal / prices).toFixed(4);
            $('#litrosFormProductos').val(litros);
            

        } else if( elementId == 'litrosFormProductos' ) {// Se calcula el total acorde a los litros

            subtotal = parseInt(litros * prices); 
            total = parseFloat(subtotal * 1.16).toFixed(4);
            $('#totalFormProductos').val(total);
            
        } else if ( elementId == 'cantidadFormProductos' ) {// 

        }

        $('#valorFormProductos').val(subtotal);
    
    } else {// Todo se coloca en 0
        
    }
}

// Guarda la información de un pedido
async function savePedido() {
    btnGuardarPedido.on('click', function () {

        let direccion        = $('#direccionCliente :selected').data('address');
        let minimoGasLp      = Number($('select#plantas').children(':selected').data('pedido-minimo'));
        let totalPedido      = 0;
        let tipoPedido       = null;
        let totalConCredito  = 0;
        let descuento        = 0;
        let totalMetodosPago = 0;
        let casoPedido       = $('select#casoPedido').val();
        let notasCredito     = $('select#creditosCliente').val();
        let tablaProd        = null;
        let canContinue      = true;
        let articulosArr     = [];
        let pagosArr         = [];
        let prepaymentArr    = [];
        let rutas            = [];
        let time             = moment().format('h:mm a');
        let saldoDisponible  = Number(customerGlobal?.objInfoComercial?.saldoDisponible);
        saldoDisponible      = isNaN(saldoDisponible) ? 0 : saldoDisponible;

        // Define cuál tabla de productos es la que se usará para calcular totales y descuentos
        if (! $('.productosEstacionarioPedido').parent().parent().hasClass('d-none') ) { // Estacionario
            tablaProd = $('.productosEstacionarioPedido');
            tipoPedido = 'estacionario';
        } else if (! $('.productosCilindroPedido').parent().parent().hasClass('d-none') ) { // Cilindro
            tablaProd = $('.productosCilindroPedido');
            tipoPedido = 'cilindro';
        }
        
        if (! tablaProd ) {// No hay productos seleccionados
            alert('Agregue al menos un producto a la lista.'); 
            return;
        }

        totalPedido = tablaProd.children('tfoot').find('td.total').data('total');
        descuento   = tablaProd.children('tfoot').find('td.descuento').data('descuento');

        // Calcula el total de método de pago basándose en los especificados en la lista
        if (! $('.productosMetodoPago').parent().parent().hasClass('d-none') ) {// Contiene métodos
            totalMetodosPago = $('.productosMetodoPago').children('tfoot').find('td.total').data('total');
        }

        // Si no se indicó una fecha prometida, una hora inicial o el total del pedido es distinto al total de métodos de pago, no permite crear el pedido
        if( !$("#fechaPrometidaPedido").val().trim() || !$('#desdePedido').val() || ( totalPedido != totalMetodosPago ) ) {
            canContinue = false;
        }

        if (! canContinue ) {
            if ( totalPedido != totalMetodosPago ) {
                alert("El total a pagar debe ser igual al total de productos enlistados");
            } else {
                alert("Favor de llenar todos los campos con *");
            }
            return; 
        }

        // Necesita verificarse el monto mínimo
        if ( tipoPedido == 'estacionario' && minimoGasLp && ( ( Number(totalPedido) + Number(descuento)) < minimoGasLp ) ) {
            alert("El monto mínimo para gas lp es de " + minimoGasLp );
            return;
        }
        
        // Agrega la lista de artículos
        tablaProd.children('tbody').children('tr.product-item').each(function(e) {
            articulosArr.push( $(this).data('item') );
        });

        // Agrega la lista de métodos de pago
        $('table.productosMetodoPago > tbody  > tr.metodo-item').each(function() {
            let metodoObj = $(this).data('metodo');
            let metodoId  = parseInt(metodoObj.tipo_pago);
            if ( metodoObj.tipo_pago == '9' ) {// El método de pago es crédito
                totalConCredito = parseFloat( Number(metodoObj.monto) ).toFixed(4);
            }
            
            // Si el método de pago es transferencia o prepago, se enviará una orden de prepago después de guardar el pedido
            if ( metodosPagoPrepago.includes( metodoId ) || metodoId == metodoTransferencia ) {
                prepaymentArr.push({
                    "customer" : customerGlobal.id,
                    "account" : metodoObj.tipo_cuenta,
                    "amount" : metodoObj.monto
                });
            }

            pagosArr.push( $( this ).data('metodo') );
        });

        let isEstacionario = $(".productosCilindroPedido").is(':hidden');
        if(isEstacionario) {
            console.log(pagosArr);
            let conti = true;
            pagosArr.forEach(element => {
                if(methodsEstacionario.indexOf(element.tipo_pago.toString()) == -1) {
                    conti = false;
                }
            });

            if(!conti) {
                infoMsg('warning', 'Alerta:', "Un metodo de pago registrado no es compatible con el tipo producto seleccionado");
                return;
            }
        }
        // Si el cliente tiene saldo a favor y seleccionó como método de pago el crédito,
        // se validará si el monto a pagar con crédito es igual o menor al límite del saldo a favor, 
        // para permitir la venta, de lo contrario no se procesa
        if ( totalConCredito > 0 ) {
            if ( totalConCredito > saldoDisponible ) { // El total a pagar con crédito excede el saldo disponible actual del cliente
                canContinue = false;
            }
        } 

        // No permite coninuar cuando no tenga saldo suficiente
        if (! canContinue ) {
            alert("El total del pedido excede el saldo disponible");
            return;
        }

        // Tiene descuento
        if ( descuento ) {
            articulosArr.push({
                "tipo"      : 4,
                "precio"    : descuento * -1,
                "article"   : articuloDesc// ID de artículo de descuento
            });
        }

        let direccionSel = $('#direccionCliente').children(':selected').data('address');
        let typeService  = '';
        let statusOpp    = 1;
        $('.productosCilindroPedido').is(':visible') ? typeService = 1 : '';
        $('.productosEstacionarioPedido').is(':visible') ? typeService = 2 : '';

        // Código para insertar las posibles rutas de la dirección del cliente
        // rutas[0] = { id : ( direccion && direccion.idRoute ? direccion.idRoute : '' ), name : ( direccion && direccion.route ? direccion.route : '') }; // Cilindro matutino
        rutas[0] = { id : direccion?.idRoute,  name : direccion?.route};// Cilindro matutino
        rutas[1] = { id : direccion?.idRoute2, name : direccion?.route2};// Cilindro vesp
        rutas[2] = { id : direccion?.idRoute3, name : direccion?.route3};// Estacionario matutino
        rutas[3] = { id : direccion?.idRoute4, name : direccion?.route4};// Estacionario vesp

        let tmp = {
            // "status"        : 1,
            "zona_precio"   : 2,//Este es el Id de la zona
            "customer"      : $('#idCliente').text(),
            "plantaRelated" : $('#plantas').val(),
            "closeDate"     : dateFormatFromDate($('#fechaPrometidaPedido').val(), '5'),
            "idAddressShip" : $('#direccionCliente').val(),
            "statusOpp"     : statusOpp,
            "operario"      : userId,
            "typeservice"   : typeService,
            "cases"         : [],
            "routes"        : rutas,
            "time"          : time,
            "turn"          : 1,
            //"paymentMethod" : $('#metodoPagoPedido').val(),
            "origen"        : $('#idCliente').val(),
            "comentary"     : $('#observacionesPagoPedido').val(),
            "rangeHour1"    : formatTime( $('#desdePedido').val() ),
            "rangeHour2"    : formatTime( $('#hastaPedido').val() ),
            "folio"         : "",
            "tipo"          : typeService,
            "items"         : articulosArr,
            "pago"          : {pago:pagosArr},
        }

        // Seleccionó un resurtido pendiente
        if ( casoPedido ) {
            tmp['case'] = casoPedido;
        }

        // Seleccionó una o varias notas de crédito
        if ( notasCredito.length > 0 ) {
            tmp['cases'] = notasCredito;
        }

        opportunities.push(tmp);

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
            getPendingCases();
            getCasosOportunidades();
            if ( prepaymentArr.length > 0 ) {// Si se realizaron prepagos, se enviará a gestionar
                sendPrepayment(prepaymentArr);
            }
        }).catch((error) => {
            opportunities = [];
            infoMsg('error', 'El pedido no ha sido creado', error.message);
            // Limpia los campos de cliente
            
            console.log('El error es: ');
            console.log(error);
        });
    });
}

// Método para envíar un prepago
function sendPrepayment(prepaymentArr) {
    let params = {
        "customerPayments" : prepaymentArr
    };

    let settings = {
        url    : urlMakePrepayment,
        method : 'POST',
        data   : JSON.stringify(params),
    }

    setAjax(settings).then((response) => {
        console.log('Prepagos enviado exitósamente', response);
    }).catch((error) => {
        // Limpia los campos de cliente
        console.log('Ha ocurrido un error al enviar los prepagos');
        console.log(error);
    });
}

async function clearFields() {
    // $('#fechaPrometidaPedido').val('');
    $('#hastaPedido, #observacionesPagoPedido').val('');

    $("#sinProductos, #sinMetodosPago").removeClass("d-none");
    
    // Remueve los productos agregados
    $("table.productosCilindroPedido").parent().parent().addClass("d-none");
    $("table.productosCilindroPedido").children('tbody').children('tr').remove();
    $("table.productosEstacionarioPedido").parent().parent().addClass("d-none");
    $("table.productosEstacionarioPedido").children('tbody').children('tr').remove();

    // Remueve los métodos de pago
    $("table.productosMetodoPago").parent().parent().addClass("d-none");
    $("table.productosMetodoPago").children('tbody').children('tr').remove();

    // Resetea el select de créditos del cliente
    $('select#creditosCliente').val(null).trigger("change");
    // $("#productosCilindroPedido").find(".content").remove();
}
//#endregion

// Elimina un artículo de la tabla
$('body').delegate('.delete-producto-cil, .delete-producto-est','click', function() {
    let item  = $(this).parent().parent().data('item');
    let table = $(this).data('table-ref');
    let id    = ( item && item.article ? item.article : 0 );

    swal({
        title: 'Se dará de baja el producto seleccionado, ¿Está seguro de continuar?',
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
    }).then((accept) => {
        if ( accept ) {
            $(table).children('tbody').children('tr[data-item-id="'+id+'"]').remove();
            validarTablaProductos( $(table) );
        }
    }).catch(swal.noop);
});

// Elimina un método de pago de la tabla
$('body').delegate('.delete-metodo-pago','click', function() {
    let metodo  = $(this).parent().parent().data('metodo');
    let table = $(this).data('table-ref');
    let id    = ( metodo && metodo.tipo_pago ? metodo.tipo_pago : 0 );

    swal({
        title: '¿Desea eliminar el método de pago seleccionado?',
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
    }).then((accept) => {
        if ( accept ) {
            $(table).children('tbody').children('tr[data-metodo-id="'+id+'"]').remove();
            validarTablaMetodosPago( $(table) );
        }
    }).catch(swal.noop);
});

// Agrega un método de pago a la tabla de métodos
function agregarMetodoPago(metodoObj) {
    let searchTr = $('table.productosMetodoPago > tbody > tr[data-metodo-id="'+metodoObj.tipo_pago+'"]');

    if ( searchTr.length ) {// Se verifica si el artículo fue previamente registrado y se edita el row

        searchTr.data('metodo', metodoObj);
        searchTr.children('td').siblings("td:nth-child(2)").text(metodoObj.folio ? metodoObj.folio : 'No aplica');
        searchTr.children('td').siblings("td:nth-child(3)").data('total', metodoObj.monto);
        searchTr.children('td').siblings("td:nth-child(3)").text('$'+metodoObj.monto+' MXN');
        console.log(metodoObj);
        
    } else {// Se llena la información del item
        
        $(".productosMetodoPago tbody").append(
            '<tr data-metodo-id='+metodoObj.tipo_pago+' class="metodo-item" data-metodo=' + "'" + JSON.stringify(metodoObj) + "'" + '>' +
                '<td>'+metodoObj.metodo_txt+'</td>'+
                '<td class="text-center">'+(metodoObj.folio ? metodoObj.folio : 'No aplica')+'</td>'+
                '<td class="text-center" data-total='+metodoObj.monto+'>$'+metodoObj.monto+' MXN</td>'+
                '<td class="text-center">'+
                    '<button class="btn btn-sm btn-danger delete-metodo-pago" data-table-ref=".productosMetodoPago" data-metodo-id='+metodoObj.tipo_pago+'> <i class="fa-solid fa-trash-can"></i> </button>'+
                '</td>'+
            '</tr>'
        );

    }
}

// Valida la información mostrada en la lista de artículos
function validarTablaProductos(table) {
    if (! table.children('tbody').children('tr.product-item').length ) {
        table.parent().parent().addClass('d-none');
        $('#sinProductos').removeClass('d-none');
    }

    setTotalPedido(table);
}

// Valida la información mostrada en la lista de métodos de pago
function validarTablaMetodosPago(table) {
    if (! table.children('tbody').children('tr.metodo-item').length ) {
        table.parent().parent().addClass('d-none');
        $('#sinMetodosPago').removeClass('d-none');
    }

    setTotalMetodosPago(table);
}

// Calcula el total de los productos
// Parámetros: 
// table: La tabla a realizar el cálculo de total de descuento
// table: El tipo de desucento a enviar: nativo, resurtido (Cilindro), nota crédito(Gas LP) 
function setTotalPedido(table, tipoDescuento = 'nativo') {
    let total           = parseFloat(0).toFixed(4);
    let totalDescontado = parseFloat(0).toFixed(4);
    let totalLitros     = parseFloat(0).toFixed(4);
    let descuento       = Number( parseFloat(customerGlobal.descuento ?? 0) ).toFixed(4);
    let esEstacionario  = !$('.productosEstacionarioPedido').parent().parent().hasClass('d-none');
    // console.log(descuento);
    table.children('tbody').children('tr.product-item').each(function() {
        let articulo = $( this ).data('item');
        if ( articulo.tipo == '1' ) { // Cilindro
            totalLitros = (Number(totalLitros) + Number( parseFloat(articulo.capacity * articulo.quantity))).toFixed(4);
        } else if  ( articulo.tipo == '2' ) { // Estacionario
            totalLitros = (Number(totalLitros) + Number( parseFloat(articulo.capacity))).toFixed(4);
        }
        let subtotal = parseFloat($( this ).children('td').siblings("td:nth-child(4)").data('total')).toFixed(4);
        total = parseFloat( Number(total) + Number(subtotal) ).toFixed(4);
    });

    if ( tipoDescuento == 'nativo' ) { // Validación para especificar el descuento natural que puede tener el cliente
        if ( customerGlobal?.tipoDescuento == '1' ) { // Porcentaje
            descuento = Number( parseFloat( descuento / 100 ) ).toFixed(4);
            totalDescontado = Number( parseFloat( descuento * total ) ).toFixed(4);
        } else if ( customerGlobal?.tipoDescuento == '2' ) { // Neto
            totalDescontado = Number( parseFloat( totalLitros * descuento ) ).toFixed(4);
        }
        if ( esEstacionario ) {// Si el producto es estacionario el descuento se multiplica por .54 para hacer la conversión de kilos a litros
            console.log('Se aplica descuento multiplicado por .54');
            totalDescontado = Number( parseFloat( totalDescontado * .54 ) ).toFixed(4);
        } 
    } else if ( tipoDescuento == 'resurtido' ) {// Descuento por devolución de cilindro
        totalDescontado = Number( parseFloat( total)).toFixed(4) ;
        console.log('Tipo: ', tipoDescuento);
    } else if ( tipoDescuento == 'nota' ) {// Descuento por nota de crédito asociado a Gas LP

    }

    total = parseFloat( Number(total) - Number(totalDescontado) ).toFixed(4);
    
    // Se asigna el descuento
    table.children('tfoot').find('td.descuento').data('descuento', totalDescontado);
    table.children('tfoot').find('td.descuento').text('$'+totalDescontado+' MXN');

    // Se asigna el total
    table.children('tfoot').find('td.total').data('total', total);
    table.children('tfoot').find('td.total').text('$'+total+' MXN');
}

// Calcula el total de los métodos de pago agregados
function setTotalMetodosPago(table) {
    let total = parseFloat(0).toFixed(4);

    table.children('tbody').children('tr.metodo-item').each(function() {
        // let articulo = $( this ).data('item');
        let subtotal = parseFloat($( this ).children('td').siblings("td:nth-child(3)").data('total')).toFixed(4);
        total = parseFloat( Number(total) + Number(subtotal) ).toFixed(4);
    });

    table.children('tfoot').find('td.total').data('total', total);
    table.children('tfoot').find('td.total').text('$'+total+' MXN');
}

// Calcula el total del método de pago
function setTotalMetodoPago(table, tipoDescuento = 'nativo') {
    let total = parseFloat(0).toFixed(4);

    if ( tipoDescuento == 'nativo' ) { // Validación para especificar el descuento natural que puede tener el cliente
        table.children('tbody').children('tr.metodo-item').each(function() {
            // let articulo = $( this ).data('item');
            let subtotal = parseFloat($( this ).children('td').siblings("td:nth-child(3)").data('total')).toFixed(4);
            total = Number(total) + Number(subtotal);
        });
    } else if ( tipoDescuento == 'resurtido' ) {// Descuento por devolución de cilindro
        total = parseFloat(0).toFixed(4);
    } else if ( tipoDescuento == 'nota' ) {// Descuento por nota de crédito asociado a Gas LP

    }

    table.children('tfoot').find('td.total').data('total', parseFloat(total).toFixed(4));
    table.children('tfoot').find('td.total').text('$'+parseFloat(total).toFixed(4)+' MXN');
}

// Método que ejecuta la cancelación de un pedido
$("#guardarCancelarOpp").click(function () {
    let canContinue = false;
    let statusID = null;
    let pedido = $("div#cancelarOppModal").data("item");
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
    }).then((accept) => {
        if ( accept ) {
            // Busca el ID del status cancelado
            estadosOppArr.forEach(element => {
                if( element.nombre.toLowerCase().trim() == "cancelado" ) {
                    statusID = element.id;
                }
            });

            let dataSend = {
                "opportunitiesUpdate": [
                    {
                        "id": pedido.id_Transaccion,
                        "bodyFields": {
                            "custbody_ptg_estado_pedido": statusID,
                            "custbody_ptg_motivo_cancelation" : $("#cancelarOppMotivo").val()
                        },
                        "lines": [
                            
                        ]
                    }
                ]
            };
            console.log('Primer data', dataSend);
            loadMsg();
            let settings = {
                url      : urlActualizarOpp,
                method   : 'PUT',
                data     : JSON.stringify(dataSend)
            }
            console.log('Settings', settings);
            setAjax(settings).then((response) => {
                console.log('exito cancelando', response);
                let nota = [{ 
                    type: "nota", 
                    idRelacionado: pedido.id_Transaccion, 
                    titulo: userName + " (Cancelación de servicio)", 
                    nota: $("#cancelarOppObservaciones").val().trim(),
                    transaccion: "oportunidad"
                }];
                let settingsNota = {
                    url      : urlGuardarNotaMensaje,
                    method   : 'POST',
                    data: JSON.stringify({ informacion: nota })
                }
                setAjax(settingsNota).then((response) => {
                    console.log('exito agregando la nota');
                    $("#cancelarOppModal").modal("hide");
                    infoMsg('success', '', "Servicio cancelado correctamente");
                }).catch((error) => {
                    console.log(error);
                    swal.close();
                });
                       
            }).catch((error) => {
                console.log(error);
                swal.close();
            });
        }
    }).catch(swal.noop);
});

// Envía una segunda llamada
$("#inputSegundaLlamada").click(function () {
    let idTransaccion = $('#internalIdServicio').val();

    if( this.checked ) {
        swal({
            title: '¿Está seguro de marcar una segunda llamada?',
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
        }).then((accept) => {
            if ( accept ) {
                let dataSend = {
                    "opportunitiesUpdate": [
                        {
                            "id": idTransaccion,
                            "bodyFields": {
                                "custbody_ptg_segundas_llamadas": true,
                            },
                            "lines": [
                                
                            ]
                        }
                    ]
                };
                loadMsg();
                let settings = {
                    url      : urlActualizarOpp,
                    method   : 'PUT',
                    data     : JSON.stringify(dataSend)
                }
                setAjax(settings).then((response) => {
                    swal.close();
                    $("#inputSegundaLlamada").prop('disabled', true);
                    getCasosOportunidades();
                    console.log('Segunda llamada enviada exitósamente', response);
                }).catch((error) => {
                    console.log(error);
                });
            } else {
                $("#inputSegundaLlamada").prop('checked', false);
            }
        }).catch(swal.noop);
    }
});

// Código para filtrado del grid de servicios y oportunidades
// Determina qué status se mostrarán acorde al tipo de caso seleccionado (Fuga/Queja)
$('select#tipoServicioFiltro').on('change', function(e) {
    let tipoServicio = $('#tipoServicioFiltro').val();
    $('select#estadoSolicitudFiltro').children('option').remove();
    $("select#estadoSolicitudFiltro").append('<option value="">Seleccione una opción</option>');
    $(".filtro-tipo-producto-casos, .filtro-tipo-producto-opp").addClass('d-none');
    // Se llenan los estatus acorde al tipo de servicio requerido
    if ( tipoServicio == 1 || tipoServicio == 2 ) {// Sólo fugas o quejas
        for (var i = 0; i < statusCasesArr.length; i++) {
            $("select#estadoSolicitudFiltro").append('<option value='+statusCasesArr[i].id+'>'+statusCasesArr[i].nombre+'</option>');
        }
        $(".filtro-tipo-producto-casos").removeClass('d-none');
    } else if( tipoServicio == 3 ) {// Oportunidades
        for (var x = 0; x < estadosOppArr.length; x++) {
            $("select#estadoSolicitudFiltro").append('<option value='+estadosOppArr[x].id+'>'+estadosOppArr[x].nombre+'</option>');
        }
        $(".filtro-tipo-producto-opp").removeClass('d-none');
    }
});

$('.filtrar-historico').on('click', function(e) {
    filtrarHistorico();
});

// Limpia los filtros de la búsqueda
function limpiarFiltrosBusqueda() {
    $('div#filtros').find('select.form-ptg').each(function( index ) {
        $( this ).val($(this).children("option:first").val());
    });
    setSelectEstatusOpp(estadosOppArr);
    $('#filtros').find('input.form-ptg').val('');
    $(".filtro-tipo-producto-casos").addClass('d-none');
    $(".filtro-tipo-producto-opp").removeClass('d-none');
    getCasosOportunidades();
}

// Filtra acorde a los parámetros proporcionados por el cliente
function filtrarHistorico() {
    let fechaAtencionIni  = $("#filtroFechaAtencionIni").val() ? dateFormatFromDate( $("#filtroFechaAtencionIni").val(), '5' ) : '';
    let fechaAtencionFin  = $("#filtroFechaAtencionFin").val() ? dateFormatFromDate( $("#filtroFechaAtencionFin").val(), '5' ) : '';
    let fechaSolicitudIni = $("#filtroFechaSolicitudIni").val() ? dateFormatFromDate( $("#filtroFechaSolicitudIni").val(), '5' ) : '';
    let fechaSolicitudFin = $("#filtroFechaSolicitudFin").val() ? dateFormatFromDate( $("#filtroFechaSolicitudFin").val(), '5' ) : '';
    let status            = $("#estadoSolicitudFiltro").val();
    let productoCaso      = $("#filtroTipoProductoCaso").val();
    let productoOpp       = $("#filtroTipoProductoOpp").val();
    let tipoServicio      = $('#tipoServicioFiltro').val();
    let tipoNombre        = '';
    let url               = '';
    let dataToSend        = { id : customerGlobal.id };
    
    // Filtro de solicitud de fecha
    fechaSolicitudIni ? dataToSend['fechaPrometida1'] = fechaSolicitudIni : '';
    fechaSolicitudFin ? dataToSend['fechaPrometida2'] = fechaSolicitudFin : '';
    
    if ( tipoServicio == 3 ) {// Oportunidades
        tipoNombre = 'oportunidades';
        url = urlGetOppV2;
        status ? dataToSend['status_oportunidad'] = status : '';
        productoOpp ? dataToSend['tipo_producto'] = productoOpp : '';
        fechaAtencionIni ? dataToSend['fechaCierre1'] = fechaAtencionIni : '';
        fechaAtencionFin ? dataToSend['fechaCierre2'] = fechaAtencionFin : '';

    } else {// Fugas o quejas
        tipoNombre = 'casos';
        url = urlGetFugaQuejasV2;
        dataToSend['tipo_servicio'] = tipoServicio;
        status ? dataToSend['estado'] = status : '';
        productoCaso ? dataToSend['itemId'] = productoCaso : '';
        fechaAtencionIni ? dataToSend['fechaVisita1'] = fechaAtencionIni : '';
        fechaAtencionFin ? dataToSend['fechaVisita2'] = fechaAtencionFin : '';
    };

    console.log('Data:', dataToSend);
    let settings = {
        url    : url,
        method : 'POST',
        data   : JSON.stringify(dataToSend)
    }

    loadMsg('Espere un momento...');

    // Se remueve la información acerca
    // setCasosOportunidades(JSON.parse(response.data));
    
    setAjax(settings).then((response) => {
        let items = response.data;
        $('div#historic-data table.table-gen tbody').children('tr').remove();
        $('div#historic-data').fadeOut();
        if ( items.length ) {
            // numero de documento, fecha
            for ( var key in items ) {
                if ( items.hasOwnProperty( key ) ) {
                    $('div#historic-data table.table-gen tbody').append(
                        setTrOppCases( items[key], tipoNombre, items.length, key )
                    );
                }
            }
        } else {
            // console.warn('No hay casos por cargar');
        }
        $('div#historic-data table').fancyTable({
            sortColumn:0,
            pagination: true,
            perPage: 10,
            searchable:false,
            sortable: false
        });
        $('div#historic-data').fadeIn('slow');
        swal.close();
        console.log(response);
    }).catch((error) => {
        swal.close();
        console.log(error);
    });
}

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