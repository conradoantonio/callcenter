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
    getArticulos();

    onClickAddProducto();

    onChangeValue();

    savePedido();
});
//#endregion



//#region Articulos

// funcion para obtener los articulos  /* Cambiar Subsidiaria */
async function getArticulos() {
    // console.log('entro en articulos');
    // urlObtenerArticulos
    await requests(urlObtenerArticulos, 'GET', {}).then(async (response) => {
        let tmpArticulos = [];
        tmpArticulos = response.data;
        console.log('trae articulos', tmpArticulos);

        await tmpArticulos.forEach(element => {
            if (element.subcidiaria === userSubsidiary && element.tipo_articulo === '1') {
                articulos.push(element);

                comboArticulos.append(`<option value='${element.id}'>${element.nombre}</option>`);
            }
        });

    }, (err) => {
        console.log('Ocurrio un error al tratar de traer los articulos');
    });
}

async function onClickAddProducto() {
    btnAddArticles.on('click', function () {

        let tmp;

        articulos.forEach(item => {
            if (comboArticulos.val() === item.id) {
                tmp = item;

                articulosGrid.push({ article: item.id, capacity: item.capacidad_litros, quantity: txtCantidad.val(), units: '1', zoneprice: "1" });
            }
        });

        console.log('tmp', tmp);
        console.log('checkBox', flagArticuloEm.val());

        let prices = $('#zonaPrecioCliente').text().replace('$', '');

        let dataItem = {
            id: tmp.id,
            producto: tmp.descipcion,
            cantidad: txtCantidad.val(),
            capacidad: tmp.capacidad_litros,
            valor: (tmp.capacidad_litros * prices) * txtCantidad.val(),
            envase: 'false'
        };

        console.log('element', dataItem);

        $("#sinProductos").addClass("d-none");
        $("#productosCilindroPedido").removeClass("d-none");
        $("#productosCilindroPedido").find(".content").append(
            '<div class="row color-primary align-items-center ft-16 pt-3 pb-1 product-item" data-item=' + "'" + JSON.stringify(dataItem) + "'" + '>' +
            '<div class="col">' +
            '<div class="row">' +
            '<div class="col-3">' +
            dataItem.producto +
            '</div>' +
            '<div class="col-2">' +
            dataItem.cantidad +
            '</div>' +
            '<div class="col-3">' +
            dataItem.capacidad +
            '</div>' +
            '<div class="col-2">' +
            dataItem.valor +
            '</div>' +
            '<div class="col-2">' +
            (dataItem.envase ? 'Si' : 'No') +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="col-auto">' +
            '<i class="fa-solid fa-ellipsis-vertical ft-24" style="cursor: pointer;"></i>' +
            '</div>' +
            '</div>'
        )
    });
}


async function onChangeValue() {
    txtCantidad.on('change', function () {
        let tmp;
        let prices = $('#zonaPrecioCliente').text().replace('$', '');


        articulos.forEach(item => {
            if (comboArticulos.val() === item.id) {
                tmp = item;
                txtValorSinIva.val((tmp.capacidad_litros * prices) * parseFloat(txtCantidad.val()));
                txtValorConIva.val((parseFloat(txtValorSinIva.val()) * 0.16) + parseFloat(txtValorSinIva.val()));
            }
        });

    });
}

async function savePedido() {
    btnGuardarPedido.on('click', function () {
        let tmp = {
            "status": "10",
            "dateCreate": "21/02/2022",
            "closeDate": "21/02/2022",
            "customer": $('#idCliente').text(),
            "operario": '',
            "route": "1",
            "turn": "1",
            "paymentMethod": "1",
            "origen": "4",
            "typeservice": "4",
            "comentary": $('#observacionesPagoPedido').val(),
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
            "items": articulosGrid
        };

        opportunities.push(tmp);

        console.log('Guardar pedido', { opportunities: opportunities });

        loadMsg('Cargando');

        requests(urlCrearPedido, 'POST', { opportunities: opportunities }).then((response) => {
            console.log('response', response);
            swal.close();
            opportunities = [];

            clearFields();

            infoMsg('success', 'Pedido', 'El pedido se a creado de manera correcta', 2000)
        });
    });
}

async function clearFields() {
    $('#fechaPrometidaPedido').val('');
    $('#desdePedido').val('');
    $('#hastaPedido').val('');
    $('#observacionesPagoPedido').text('');

    $("#sinProductos").removeClass("d-none");
    $("#productosCilindroPedido").addClass("d-none");
    $("#productosCilindroPedido").find(".content").remove();
}
//#endregion



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