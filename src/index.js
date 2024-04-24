addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});


function handleCORS(response) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
}


async function handleRequest(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(part => part);

    if (request.method === 'OPTIONS') {
        return handleCORS(new Response(null, { status: 204 }));
    }

   
    switch (pathParts[0]) {
        case 'menu':
            return handleMenuRequest(pathParts, request);
        case 'reservation':
            return handleReservationRequest(pathParts, request);
		case 'login':
				return handleLoginRequest(pathParts, request);
		case 'registre':
				return handleRegistreRequest(pathParts, request);
					
        default:
            return new Response("Not Found", { status: 404 });
    }
}


async function handleMenuRequest(pathParts, request) {
    if (pathParts.length === 1) {
        switch (request.method) {
            case 'GET':
                return getMenuItems();
            case 'POST':
                return addMenuItem(request);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    } else if (pathParts.length === 2) {
        const itemId = pathParts[1];
        switch (request.method) {
            case 'GET':
                return getMenuItemById(itemId);
            case 'PUT':
                return updateMenuItem(request, itemId);
            case 'DELETE':
                return deleteMenuItem(itemId);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
}


async function handleReservationRequest(pathParts, request) {
    if (pathParts.length === 1) {
        switch (request.method) {
            case 'GET':
                return getReservations();
            case 'POST':
                return addReservation(request);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    } else if (pathParts.length === 2) {
        const reservationId = pathParts[1];
        switch (request.method) {
            case 'GET':
                return getReservationById(reservationId);
            case 'PUT':
                return updateReservation(request, reservationId);
            case 'DELETE':
                return deleteReservation(reservationId);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
}
async function handleRegistreRequest(pathParts, request) {
    if (pathParts.length === 1) {
        switch (request.method) {
            case 'GET':
                return getComptes();
            case 'POST':
                return addCompte(request);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
		
    } else if (pathParts.length === 2) {
        const compteId = pathParts[1];
        switch (request.method) {
            case 'GET':
                return getCompteById(compteId);
            case 'PUT':
                return updateCompte(request, compteId);
            case 'DELETE':
                return deleteCompte(compteId);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
	
}
async function handleLoginRequest(pathParts, request) {
    if (pathParts.length === 1) {
        switch (request.method) {
            case 'GET':
                return getComptes();
            case 'POST':
                return checkLogin(request);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
		
    } else if (pathParts.length === 2) {
        const compteId = pathParts[1];
        switch (request.method) {
            case 'GET':
                return getCompteById(compteId);
            case 'PUT':
                return updateCompte(request, compteId);
            case 'DELETE':
                return deleteCompte(compteId);
            default:
                return new Response("Method Not Allowed", { status: 405 });
        }
    }
	
}





async function getMenuItemById(itemId) {
    try {
        const items = await Restaurant.get('menu_items', 'json') || [];
        const item = items.find(item => item.id.toString() === itemId);
        if (!item) {
            return handleCORS(new Response("Item not found", { status: 404 }));
        }
        return handleCORS(new Response(JSON.stringify(item), {
            headers: { 'Content-Type': 'application/json' }
        }));
    } catch (error) {
        console.error("Error fetching menu item by ID:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}
async function getMenuItems() {
    try {
        const data = await Restaurant.get('menu_items', 'json');
        if (!data) {
            return handleCORS(new Response("[]", {
                headers: { 'Content-Type': 'application/json' }
            }));
        }
        return handleCORS(new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        }));
    } catch (error) {
        console.error("Failed to get menu items:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}


async function addMenuItem(request) {
    try {
        const newItem = await request.json();
        let items = await Restaurant.get('menu_items', 'json') || [];

        
        let maxId = 0;
        items.forEach(item => {
            if (item.id > maxId) maxId = item.id;
        });
        newItem.id = maxId + 1; 

        items.push(newItem);
        await Restaurant.put('menu_items', JSON.stringify(items));

        return handleCORS(new Response(JSON.stringify(newItem), {
            headers: { 'Content-Type': 'application/json' },
            status: 201
        }));
    } catch (error) {
        console.error("Failed to add menu item:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}


async function updateMenuItem(request) {
    try {
        const updateData = await request.json();
        let items = await Restaurant.get('menu_items', 'json') || [];
        const index = items.findIndex(item => item.id === updateData.id);
        if (index === -1) {
            return handleCORS(new Response("Item not found", { status: 404 }));
        }
        items[index] = {...items[index], ...updateData};
        await Restaurant.put('menu_items', JSON.stringify(items));
        return handleCORS(new Response(JSON.stringify(items[index]), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        }));
    } catch (error) {
        console.error("Failed to update menu item:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}

async function deleteMenuItem(itemId) {
    try {
        let items = await Restaurant.get('menu_items', 'json') || [];
        const index = items.findIndex(item => item.id.toString() === itemId.toString());
        if (index === -1) {
            return handleCORS(new Response("Item not found", { status: 404 }));
        }
        items.splice(index, 1); 
        await Restaurant.put('menu_items', JSON.stringify(items)); 
        return handleCORS(new Response(null, { status: 204 })); 
    } catch (error) {
        console.error("Failed to delete menu item:", error);
        return handleCORS(new Response("Internal Server Error: " + error.message, { status: 500 }));
    }
}
async function getReservations() {
    try {
        const data = await Restaurant.get('reservation', 'json');
        if (!data) {
            return handleCORS(new Response("[]", {
                headers: { 'Content-Type': 'application/json' }
            }));
        }
        return handleCORS(new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json'
	}}));
    } catch (error) {
        console.error("Failed to get reservations:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}
async function getReservationById(reservationId) {
    try {
        const reservations = await Restaurant.get('reservation', 'json') || [];
        const reservation = reservations.find(reservation => reservation.id.toString() === reservationId);
        if (!reservation) {
            return handleCORS(new Response("reservation not found", { status: 404 }));
        }
        return handleCORS(new Response(JSON.stringify(reservation), {
            headers: { 'Content-Type': 'application/json' }
        }));
    } catch (error) {
        console.error("Error fetching menu reservation by ID:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }}
	async function addReservation(request) {
		try {
			const newReservation = await request.json();
			let reservations = await Restaurant.get('reservation', 'json') || [];
	
			
			if (!isTableAvailable(reservations, newReservation.table, newReservation.date)) {
				return handleCORS(new Response(JSON.stringify({ message: "Table is not available within one hour of your requested time" }), {
					status: 409, 
					headers: { 'Content-Type': 'application/json' }
				}));
			}
	
			
			const maxId = reservations.reduce((max, item) => item.id > max ? item.id : max, 0);
			newReservation.id = maxId + 1; 
	
			
			reservations.push(newReservation);
			await Restaurant.put('reservation', JSON.stringify(reservations));
	
			
			return handleCORS(new Response(JSON.stringify(newReservation), {
				headers: { 'Content-Type': 'application/json' },
				status: 201
			}));
		} catch (error) {
			console.error("Failed to add reservation:", error);
			return handleCORS(new Response("Internal Server Error", { status: 500 }));
		}
	}
	
	
	async function updateReservation(request, reservationId) {
		try {
			const updateData = await request.json();
			let reservations = await Restaurant.get('reservation', 'json') || [];
			const index = reservations.findIndex(reservation => reservation.id.toString() === reservationId);
	
			if (index === -1) {
				return handleCORS(new Response("Reservation not found", { status: 404 }));
			}
	
			
			if (!isTableAvailable(reservations, updateData.table, updateData.date, reservationId)) {
				return handleCORS(new Response(JSON.stringify({ message: "Table is not available within one hour of your requested time" }), {
					status: 409, 
					headers: { 'Content-Type': 'application/json' }
				}));
			}
	
			reservations[index] = {...reservations[index], ...updateData};
			await Restaurant.put('reservation', JSON.stringify(reservations));
			
			return handleCORS(new Response(JSON.stringify(reservations[index]), {
				headers: { 'Content-Type': 'application/json' },
				status: 200
			}));
		} catch (error) {
			console.error("Failed to update reservation:", error);
			return handleCORS(new Response("Internal Server Error", { status: 500 }));
		}
	}
	
	
	function isTableAvailable(reservations, tableNumber, desiredDate, ignoreId = null) {
		const desiredDateTime = new Date(desiredDate).getTime();
		const oneHour = 60 * 60 * 1000; 
	
		return !reservations.some(reservation => {
			if (ignoreId && reservation.id.toString() === ignoreId.toString()) return false; 
			if (reservation.table !== tableNumber) return false; 
	
			const reservationDateTime = new Date(reservation.date).getTime();
			return Math.abs(reservationDateTime - desiredDateTime) < oneHour;
		});
	}
	
	
	async function deleteReservation(reservationId) {
		try {
			let reservations = await Restaurant.get('reservation', 'json') || [];
			const index = reservations.findIndex(reservation => reservation.id.toString() === reservationId.toString());
			if (index === -1) {
				return handleCORS(new Response("Item not found", { status: 404 }));
			}
			reservations.splice(index, 1); 
			await Restaurant.put('reservation', JSON.stringify(reservations));
			return handleCORS(new Response(null, { status: 204 })); 
		} catch (error) {
			console.error("Failed to delete reservations item:", error);
			return handleCORS(new Response("Internal Server Error: " + error.message, { status: 500 }));
		}

	}
	async function getComptes() {
		try {
			const data = await Restaurant.get('login', 'json');
			if (!data) {
				return handleCORS(new Response("[]", {
					headers: { 'Content-Type': 'application/json' }
				}));
			}
			return handleCORS(new Response(JSON.stringify(data), {
				headers: { 'Content-Type': 'application/json' }
			}));
		} catch (error) {
			console.error("Failed to get compte:", error);
			return handleCORS(new Response("Internal Server Error", { status: 500 }));
		}
	}
	async function getCompteById(compteIdId) {
		try {
			const comptes = await Restaurant.get('login', 'json') || [];
			const compte = comptes.find(comptes => comptes.id.toString() === compteIdId);
			if (!comptes) {
				return handleCORS(new Response("compte not found", { status: 404 }));
			}
			return handleCORS(new Response(JSON.stringify(compte), {
				headers: { 'Content-Type': 'application/json' }
			}));
		} catch (error) {
			console.error("Error fetching compte by ID:", error);
			return handleCORS(new Response("Internal Server Error", { status: 500 }));
		}
	}
	
	async function addCompte(request) {
		try {
			const newCompte = await request.json();
			let comptes = await Restaurant.get('login', 'json') || [];
			
		
			const exists = comptes.some(compte => compte.username === newCompte.username || compte.email === newCompte.email);
			if (exists) {
				return handleCORS(new Response(JSON.stringify({ message: "Username or email already exists" }), {
					headers: { 'Content-Type': 'application/json' },
					status: 409 
				}));
			}
	
			
			newCompte.id = comptes.length + 1;
			comptes.push(newCompte);
			await Restaurant.put('login', JSON.stringify(comptes));
	
			return handleCORS(new Response(JSON.stringify(newCompte), {
				headers: { 'Content-Type': 'application/json' },
				status: 201
			}));
		} catch (error) {
			console.error("Failed to add compte:", error);
			return handleCORS(new Response("Internal Server Error", { status: 500 }));
		}
	}
	


async function updateCompte(request) {
    try {
        const updateData = await request.json();
        let comptes = await Restaurant.get('login', 'json') || [];
        const index = comptes.findIndex(compte => compte.id === updateData.id);
        if (index === -1) {
            return handleCORS(new Response("Compte not found", { status: 404 }));
        }
        
        comptes[index] = {...comptes[index], ...updateData};
        await Restaurant.put('login', JSON.stringify(comptes));
        return handleCORS(new Response(JSON.stringify(comptes[index]), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        }));
    } catch (error) {
        console.error("Failed to update compte:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}

async function deleteCompte(compteId) {
    try {
        let comptes = await Restaurant.get('login', 'json') || [];
        const index = comptes.findIndex(compte => compte.id.toString() === compteId.toString());
        if (index === -1) {
            return handleCORS(new Response("Compte not found", { status: 404 }));
        }
        comptes.splice(index, 1); 
        await Restaurant.put('login', JSON.stringify(comptes)); 
        return handleCORS(new Response(null, { status: 204 })); 
    } catch (error) {
        console.error("Failed to delete compte:", error);
        return handleCORS(new Response("Internal Server Error: " + error.message, { status: 500 }));
    }
}

async function checkLogin(request) {
    try {
        const loginData = await request.json();
        const comptes = await Restaurant.get('login', 'json') || [];

        
        const compte = comptes.find(
            c => c.username === loginData.username || c.email === loginData.email
        );

       
        if (compte) {
            if (compte.password === loginData.password) {
           
                return handleCORS(new Response(JSON.stringify({ message: "Login successful" }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 200 
                }));
            } else {
              
                return handleCORS(new Response(JSON.stringify({ message: "Invalid password" }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 401 
                }));
            }
        } else {
        
            return handleCORS(new Response(JSON.stringify({ message: "Invalid username or email" }), {
                headers: { 'Content-Type': 'application/json' },
                status: 401
            }));
        }
    } catch (error) {
        console.error("Failed to check login:", error);
        return handleCORS(new Response("Internal Server Error", { status: 500 }));
    }
}


