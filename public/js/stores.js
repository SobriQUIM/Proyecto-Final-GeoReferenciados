import { api } from './api.js';
import { auth } from './auth.js';

auth.checkAuth();
const user = auth.getUser();

// Initialize Map
const map = L.map('map').setView([19.4326, -99.1332], 13); // Mexico City default
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Feature Group for drawn items
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

let currentPolygon = null;
let currentMarker = null;
let editingStoreId = null;

// Admin controls
if (user.role === 'admin') {
    const drawControl = new L.Control.Draw({
        draw: {
            polygon: true,
            marker: true,
            circle: false,
            rectangle: false,
            polyline: false,
            circlemarker: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
        const type = e.layerType;
        const layer = e.layer;

        if (type === 'polygon') {
            if (currentPolygon) drawnItems.removeLayer(currentPolygon);
            currentPolygon = layer;
            drawnItems.addLayer(layer);
        } else if (type === 'marker') {
            if (currentMarker) drawnItems.removeLayer(currentMarker);
            currentMarker = layer;
            drawnItems.addLayer(layer);

            // Sync inputs
            const latLng = layer.getLatLng();
            document.getElementById('lat').value = latLng.lat;
            document.getElementById('lng').value = latLng.lng;
        }
    });

    // Listen to manual input changes
    const updateMarkerFromInputs = () => {
        const lat = parseFloat(document.getElementById('lat').value);
        const lng = parseFloat(document.getElementById('lng').value);
        if (!isNaN(lat) && !isNaN(lng)) {
            if (currentMarker) drawnItems.removeLayer(currentMarker);
            currentMarker = L.marker([lat, lng]);
            drawnItems.addLayer(currentMarker);
            map.setView([lat, lng], 15);
        }
    };
    document.getElementById('lat').addEventListener('change', updateMarkerFromInputs);
    document.getElementById('lng').addEventListener('change', updateMarkerFromInputs);

} else {
    // Hide Admin-only elements
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
}

// Load Stores
async function loadStores(query = '') {
    try {
        const endpoint = query ? `/stores/search?name=${query}` : '/stores';
        const stores = await api.get(endpoint);

        const list = document.getElementById('stores-list');
        list.innerHTML = '';

        // Clear existing map layers (except drawn items for new store)
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polygon) {
                if (!drawnItems.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            }
        });

        stores.forEach(store => {
            // Add to list
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${store.name}</h3>
                <p>${store.address}</p>
                <small>${store.description || ''}</small>
                ${user.role === 'admin' ? `
                    <div style="margin-top: 10px; display: flex; gap: 0.5rem;">
                        <button class="btn sm edit-btn" data-id="${store._id}" style="background:#f1c40f; color:black;">Editar</button>
                        <button class="btn sm delete-btn" data-id="${store._id}" style="background:#e74c3c">Eliminar</button>
                    </div>
                ` : ''}
            `;
            list.appendChild(card);

            // Add to map
            if (store.location && store.location.coordinates) {
                const marker = L.marker([store.location.coordinates[1], store.location.coordinates[0]])
                    .addTo(map);

                const popupContent = `
                    <b>${store.name}</b><br>${store.address}
                    ${user.role === 'admin' ? `
                        <div style="margin-top: 5px;">
                            <button class="btn sm edit-btn-popup" data-id="${store._id}" style="background:#f1c40f; color:black; padding: 2px 5px; font-size: 10px;">Editar</button>
                            <button class="btn sm delete-btn-popup" data-id="${store._id}" style="background:#e74c3c; padding: 2px 5px; font-size: 10px;">Eliminar</button>
                        </div>
                    ` : ''}
                `;
                marker.bindPopup(popupContent);
            }

            if (store.zone && store.zone.coordinates) {
                // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
                // But Mongoose stores [[[lng, lat], ...]] for Polygon
                // We need to flip them for Leaflet
                const latLngs = store.zone.coordinates[0].map(coord => [coord[1], coord[0]]);
                L.polygon(latLngs, { color: 'blue', fillOpacity: 0.1 }).addTo(map);
            }
        });

        // If searching and found one, fly to it
        if (query && stores.length > 0 && stores[0].location) {
            map.flyTo([stores[0].location.coordinates[1], stores[0].location.coordinates[0]], 15);
        }

        // Add delete listeners
        if (user.role === 'admin') {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('¿Estás seguro de eliminar esta tienda?')) {
                        try {
                            await api.delete(`/stores/${e.target.dataset.id}`);
                            loadStores();
                        } catch (err) {
                            alert(err.message);
                        }
                    }
                });
            });
        }

        // Add delete listeners
        if (user.role === 'admin') {
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (confirm('¿Estás seguro de eliminar esta tienda?')) {
                        try {
                            await api.delete(`/stores/${e.target.dataset.id}`);
                            loadStores();
                        } catch (err) {
                            alert(err.message);
                        }
                    }
                });
            });
        }

    } catch (err) {
        console.error(err);
    }
}

// Create Store
const form = document.getElementById('store-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentPolygon || !currentMarker) {
            alert('Por favor dibuja la zona (polígono) y la ubicación (marcador) en el mapa.');
            return;
        }

        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const description = document.getElementById('description').value;

        // Prepare GeoJSON data
        // Leaflet Polygon: array of LatLng objects
        // Mongo Expects: [[[lng, lat], [lng, lat], ...]] (closed loop)
        const latLngs = currentPolygon.getLatLngs()[0];
        const coordinates = latLngs.map(ll => [ll.lng, ll.lat]);
        // Close the loop
        if (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1]) {
            coordinates.push(coordinates[0]);
        }

        const markerLatLng = currentMarker.getLatLng();

        const storeData = {
            name,
            address,
            description,
            zone: {
                type: 'Polygon',
                coordinates: [coordinates]
            },
            location: {
                type: 'Point',
                coordinates: [markerLatLng.lng, markerLatLng.lat]
            }
        };

        try {
            if (editingStoreId) {
                await api.patch(`/stores/${editingStoreId}`, storeData);
                alert('Tienda actualizada exitosamente');
                editingStoreId = null;
                document.querySelector('button[type="submit"]').textContent = 'Guardar Tienda';
            } else {
                await api.post('/stores', storeData);
                alert('Tienda creada exitosamente');
            }
            form.reset();
            drawnItems.clearLayers();
            currentPolygon = null;
            currentMarker = null;
            loadStores();
        } catch (err) {
            alert(err.message);
        }
    });
}

// Search
document.getElementById('search-btn').addEventListener('click', () => {
    const query = document.getElementById('search-input').value;
    loadStores(query);
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    auth.logout();
});

// Initial load
loadStores();
