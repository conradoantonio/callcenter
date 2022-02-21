//#region Variable de Elementos

let comboArticulos = $('#capacidadFormProductos');
let btnAddArticles = $('#guardarProductosForm');
let txtZonaPrecios = $('#zonaPrecioCliente');

//#endregion



//#region Variables de objetos

let articulos = [];
let articleGrid = [];

//#endregion



//#region ciclo de vida de ejecucion
$(document).ready(function () {
    // Funcion para obtener los articulos
    getArticulos();

    onClickAddProducto();
});
//#endregion



//#region Articulos

// funcion para obtener los articulos  /* Cambiar Subsidiaria */
async function getArticulos() {
    // urlObtenerArticulos
    await requests(urlObtenerArticulos, 'GET', {}).then(async (response) => {
        let tmpArticulos = [];
        tmpArticulos = JSON.parse(response);

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
        console.log('Get Item Selected', comboArticulos.val());
        let dataItem = {
            producto: await articulos.find(item => item.id === comboArticulos.val()),
            cantidad: '1',
            capacidad: '1',
            valor: '1',
            envase: '1'
        };

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