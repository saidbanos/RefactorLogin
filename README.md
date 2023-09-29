# Proyecto Segunda Entrega
Servidor basado express que profesionaliza la base de datos de MongoDB

## Pasos a seguir para correr la aplicacion:
- npm i
- node src/app.js
- El servidor iniciara en el puerto 8080.

## Testing de la aplicacion:
- Se abrirá la ruta raíz desde el navegador a la url http://localhost:8080
- Debe visualizarse el contenido de la vista index.handlebars, el cual debe mostrar los productos iniciales.
- Se buscará en la url del navegador la ruta http://localhost:8080/products
- Se corroborará que el servidor haya conectado con el cliente, en la consola del servidor deberá mostrarse un mensaje de “Nuevo cliente conectado”.
- Se debe mostrar la lista de productos y se corroborará que se esté enviando desde websocket.
- Se podran hacer la mismas consultas hechas previamente para productos y carrito, ademas de las nuevos endpoints de este entregable.
