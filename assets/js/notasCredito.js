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

// Método para llenar el select de origen de servicio
function setSelectPendingCases(items) {
    let select = $('select#casoPedido');
   
    if ( items.length ) {
        select.append('<option value="">Seleccione una opción</option>');
        select.parent().parent().removeClass('d-none');
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                if (! items[key].isComing ) {
                    select.append(
                        '<option value='+items[key].id+'>NO. CASO: '+items[key].nCase+' - ITEM: '+items[key].item+'</option>'
                    );
                }
            }
        }
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