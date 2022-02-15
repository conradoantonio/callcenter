// Código de Conrado y Christian

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
            setHistoricTable('pedidos', data);

        }, error: function (xhr, status, error) {
            console.log('Error en la consulta', error);
        }
    });
}

function setHistoricTable(type = 'pedidos',  data) {
    $('div#historic-data').fadeOut();
    let items = [];

    if( type == 'pedidos' ){
        items = data.oportunidades;
    } else{
        items = data.casos;
    }

    $('div#historic-data table.table-gen tbody').children('tr').remove();

    if ( items.length ) {
        // console.log('Tiene varios registros');
        for ( var key in items ) {
            if ( items.hasOwnProperty( key ) ) {
                console.log('entró a hacer un append');
                $('div#historic-data table.table-gen tbody').append(
                    '<tr>'+
                        '<td>Popover</td>'+
                        '<td>Checkbox</td>'+
                        '<td>Red b</td>'+
                        '<td>'+items[key].fecha+'</td>'+
                        '<td>'+( items[key].fechaNotificacion ?? 'Sin fecha visita' )+'</td>'+
                        '<td>'+( items[key].horaCierre ?? 'Sin hora cierre' )+'</td>'+
                        '<td>'+( items[key].numeroDocumento ?? 'Sin número de documento' )+'</td>'+
                        '<td>'+( items[key].numeroCaso ?? 'Sin número de caso' )+'</td>'+
                        '<td>'+( items[key].asunto ?? 'Sin asunto' )+'</td>'+
                        '<td>'+( items[key].nombreCliente ?? 'Sin nombre de cliente' )+'</td>'+
                        '<td>'+( items[key].telefono ?? 'Sin teléfono' )+'</td>'+
                        '<td>'+( items[key].representanteVentas ?? 'Sin agente' )+'</td>'+
                        '<td>'+( items[key].monitor ?? 'Sin asignado' )+'</td>'+
                        '<td>'+( items[key].estado ?? 'Sin estado' )+'</td>'+
                        '<td>'+( items[key].prioridad ?? 'Sin prioridad' )+'</td>'+
                        '<td>'+( items[key].motivoCancelacion ?? '' )+'</td>'+
                        '<td>'+( items[key].cierrePrevisto ?? 'Sin asignar' )+'</td>'+
                        '<td>'+( items[key].horaCierre ?? 'Sin hora cierre' )+'</td>'+
                        '<td>'+( items[key].origenServicio ? items[key].origenServicio : 'Sin origen servicio' )+'</td>'+
                        '<td>'+( items[key].tipoServicio ?? 'Sin tipo servicio' )+'</td>'+
                        '<td>'+( items[key].articulo ?? 'Sin artículo' )+'</td>'+
                        '<td>'+( items[key].fechaNotificacion ?? 'Sin fecha notificación' )+'</td>'+
                        '<td>'+( items[key].tipoTransaccion ?? 'Sin tipo transacción' )+'</td>'+
                        '<td>'+( items[key].nota ?? 'Sin nota' )+'</td>'+
                        '<td>'+( items[key].conductorAsignado ?? 'Sin conductor asignado' )+'</td>'+
                        '<td>'+( items[key].metodoPago ?? 'Sin método de pago' )+'</td>'+
                        '<td>'+( items[key].notaRapida ?? 'Sin nota rápida' )+'</td>'+
                        '<td>'+( items[key].unidad ?? 'Sin unidad' )+'</td>'+
                    '</tr>'
                );
            }
        }
    } else {
        console.warn('No hay plantas por cargar');
    }

    // Vuelve a mostrar la tabla
    $('div#historic-data').fadeIn('slow');
}


// Fin de código de Conrado y Christian