// Función para obtener la lista de origen del servicio
function getPendingCases() {
    let settings = {
        url    : urlGetListCaseReplacement,
        method : 'POST',
        data   : JSON.stringify({ "customer" : customerGlobal?.id })
    }

    // Se remueven los pedidos pendientes del cliente
    $('select#casoPedido').parent().parent().addClass('d-none');
    $('select#casoPedido').children('option').remove();

    setAjax(settings).then((response) => {
        resurtidosPendientesCliente = response.data;
        setSelectPendingCases((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Función para obtener la lista de créditos disponibles
function getListCreditCustomer() {
    let settings = {
        url    : urlGetListCreditMemoCustomer,
        method : 'POST',
        data   : JSON.stringify({ "customer" : customerGlobal?.id })
    }

    // Se remueven los pedidos pendientes del cliente
    $('select#creditosCliente').parent().parent().addClass('d-none');
    $('select#creditosCliente').children('option').remove();

    setAjax(settings).then((response) => {
        resurtidosPendientesCliente = response.data;
        setSelectCreditList((response.data));
    }).catch((error) => {
        console.log(error);
    });
}

// Método para llenar el select de origen de servicio
function setSelectPendingCases(items) {
    let select = $('select#casoPedido');
    let aux    = [];
   
    if ( items.length ) {
        select.append('<option value="">Seleccione una opción</option>');
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                if ((! items[key].isComming) && items[key].itemId != articuloGasLp ) {
                    aux.push(items[key]);
                    select.append(
                        '<option value='+items[key].id+' data-item=' + "'" + JSON.stringify(items[key]) + "'" + '>NO. CASO: '+items[key].nCase+' - ITEM: '+items[key].item+'</option>'
                    );
                }
            }
        }

        // Sólo se mostrará el select si tiene casos pendientes
        if ( aux.length ) {
            select.parent().parent().removeClass('d-none');
        }
    } else {
        console.warn('No hay registros por cargar');
    }
}

// Método para llenar el select de lista de créditos del cliente
function setSelectCreditList(items) {
    let select = $('select#creditosCliente');
   
    if ( items.length ) {
        select.parent().parent().removeClass('d-none');
        select.append('<option value="" disabled>Seleccione una opción</option>');
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                select.append(
                    '<option value='+items[key].id+' data-item=' + "'" + JSON.stringify(items[key]) + "'" + '>No. transacción: '+items[key].docNumber+' - Monto: $'+items[key].total+'mxn</option>'
                );
            }
        }

        select.select2({
            // selectOnClose: true,
            // placeholder: "Seleccione una opción",
            // language: {
            //     "noResults": function(){
            //         return "Sin resultados encontrados";
            //     }
            // }
        });
    } else {
        console.warn('No hay registros por cargar');
    }
}

// Abre el modal para ver las notas y agregar un descuento si es que quiere
function verNotasAgregarDescuento($this) {
    let pedido = $($this).closest("tr").data("item");
    
    $("#formAgregarDescuentoModal").data("item", pedido);
    $('.servicio-id').html(pedido.id_Transaccion ? " - " + pedido.id_Transaccion : '');
    $('table.table-notas tbody').children('tr').remove();
    $('table.table-desgloce-art tbody').children('tr').remove();
    $('table.table-desgloce-metodos-pago tbody').children('tr').remove();
    
    setMetodosPago(pedido, 'oportunidad');
    getMsgNotes(pedido, 'oportunidad');
    getItemPedido(pedido, 'oportunidad');
    $("#formAgregarDescuentoModal").modal("show");

}

// Valida si se agrega un descuento y/o nota al servicio
function guardarDescuentoNota() {
    let pedido      = $("div#formAgregarDescuentoModal").data("item");
    let canContinue = false;
    let nota        = $('#formAgregarDescuentoModal textarea.nuevaNotaAdicional').val();
    let descuento   = $('#formAgregarDescuentoModal input[name=inputAgregarDescuento]').val();
    let nuevo       = $('div#formAgregarDescuentoModal table.table-desgloce-art tbody').children('tr.descuento').length > 0 ? false : true;
    nuevaNotaAdicional
    if( !$("#inputAgregarDescuento").val() ) {
        canContinue = false;
    } else {
        canContinue = true;
    }

    if (! canContinue ) { 
        alert("Favor de llenar todos los campos con *");
        return; 
    }

    let dataDescuento = {
        "opportunitiesUpdate": [
            {
                "id": pedido.id_Transaccion,
                "bodyFields": {},
                "lines": [
                    {
                        'article'    : articuloDesc,
                        'rate'       : parseFloat( Number(descuento) * -1 ).toFixed(2),
                        'isDiscount' : true,
                        'nuevo'      : nuevo,
                    }
                ]
            }
        ]
    };

    loadMsg();
    let settings = {
        url      : urlActualizarOpp,
        method   : 'PUT',
        data     : JSON.stringify(dataDescuento)
    }
    setAjax(settings).then((response) => {
        swal.close();
        console.log(response);                
    }).catch((error) => {
        swal.close();
        console.log(error);
    });

    // Guarda una nota
    if ( nota ) {
        let newNota = [{ 
            type: "nota", 
            idRelacionado: pedido.id_Transaccion, 
            titulo: userName + " (Nota de descuento)", 
            nota: nota,
            transaccion: "oportunidad"
        }];

        let settingsNota = {
            url      : urlGuardarNotaMensaje,
            method   : 'POST',
            data: JSON.stringify({ informacion: newNota })
        }
        setAjax(settingsNota).then((response) => {
            console.log('exito agregando la nota: ', response);
        }).catch((error) => {
            console.log(error);
        });
    }

    $('#formAgregarDescuentoModal').modal('hide');
}

// Se seleccionó un resurtido pendiente
$('select#casoPedido').on('change', function(e) {
    let val = $(this).val();
    let obj = $(this).children(':selected').data('item');
    clearFields();
    if ( val ) { // Se prellena el producto del caso y se coloca como método de pago "Reposición por queja"
        armarCasoPendiente(obj);
    } else { // Se reinicia el formulario de pedidos, vaciando tablas de productos, métodos de pago
        $('#agregarProducto, #agregarMetodoPago').attr('disabled', false);
    }
});

// Arma el formulario de pedido acorde
function armarCasoPendiente (casoArt) {
    let metodoReposicion = 10;
    let table = null;
    let metodoItem = metodosPago.find( metodo => parseInt(metodo.id) === metodoReposicion );

    $('#agregarProducto, #agregarMetodoPago').attr('disabled', true);
    $('#sinProductos').addClass('d-none')
    table = $('.productosCilindroPedido');
    table.parent().parent().removeClass('d-none');
    
    let capacidad  = Number(parseInt(casoArt.capacity));
    let zonaPrecio = Number(parseFloat(casoArt.priceZone).toFixed(2));
    let total      = parseFloat( capacidad * zonaPrecio ).toFixed(2);
    let articulo   = {
        "zoneprice" : zonaPrecio,// Este es el valor de la zona de precio
        "tipo"      : 1,
        "capacity"  : capacidad,
        "quantity"  : 1,
        "article"   : casoArt.itemId
    };
    
    table.children("tbody").append(
        '<tr data-item-id='+articulo.article+' class="product-item" data-item=' + "'" + JSON.stringify(articulo) + "'" + '>' +
            '<td class="text-center">'+( casoArt.item ?? 'No asignado')+'</td>'+
            '<td class="text-center">'+capacidad+' kg</td>'+
            '<td class="text-center">'+articulo.quantity+'</td>'+
            '<td class="text-center" data-total='+total+'>$'+total+' mxn</td>'+
            '<td class="text-center">'+
                '<button class="btn btn-sm btn-info edit-producto-cil" disabled> <i class="fa fa-pen-to-square"></i> </button> '+
                '<button class="btn btn-sm btn-danger delete-producto-cil" disabled data-table-ref=".productosCilindroPedido" data-item-id='+articulo.article+'> <i class="fa-solid fa-trash-can"></i> </button>'+
            '</td>'+
        '</tr>'
    );

    setTotalPedido(table, 'resurtido');

    // Se agrega el método de pago reposición por queja
    $('#sinMetodosPago').addClass('d-none');
    $('.productosMetodoPago').parent().parent().removeClass('d-none');

    let metodoObj = {
        metodo_txt : metodoItem.method,
        tipo_pago  : metodoItem.id,
        monto      : 0.00,
        folio      : '',
    };

    $(".productosMetodoPago tbody").append(
        '<tr data-metodo-id='+metodoItem.id+' class="metodo-item" data-metodo=' + "'" + JSON.stringify(metodoObj) + "'" + '>' +
            '<td>'+metodoItem.method+'</td>'+
            '<td class="text-center">No aplica</td>'+
            '<td class="text-center" data-total='+metodoObj.monto+'>$'+metodoObj.monto+' mxn</td>'+
            '<td class="text-center">'+
                '<button class="btn btn-sm btn-danger delete-metodo-pago" data-table-ref=".productosMetodoPago" data-metodo-id='+metodoObj.id+' disabled> <i class="fa-solid fa-trash-can"></i> </button>'+
            '</td>'+
        '</tr>'
    );

    setTotalMetodoPago( $(".productosMetodoPago"), 'resurtido' );
}
