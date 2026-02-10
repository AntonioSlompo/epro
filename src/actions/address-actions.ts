'use server';

interface AddressData {
    cep: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    service: string;
    location?: {
        type: string;
        coordinates: {
            longitude: string;
            latitude: string;
        };
    };
}

export interface AddressResponse {
    success: boolean;
    data?: {
        street: string;
        neighborhood: string;
        city: string;
        state: string;
        latitude?: number;
        longitude?: number;
    };
    error?: string;
}

export async function fetchAddressByCep(cep: string): Promise<AddressResponse> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
        return { success: false, error: 'CEP inválido' };
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Ensure fresh data
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'CEP não encontrado' };
            }
            throw new Error(`BrasilAPI error: ${response.statusText}`);
        }

        const data: AddressData = await response.json();

        let latitude: number | undefined;
        let longitude: number | undefined;

        if (data.location?.coordinates) {
            latitude = parseFloat(data.location.coordinates.latitude);
            longitude = parseFloat(data.location.coordinates.longitude);
        } else {
            // Fallback to nominatim if coordinates are missing from BrasilAPI
            try {
                const addressQuery = `${data.street}, ${data.city}, ${data.state}, Brazil`;
                const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`, {
                    headers: {
                        'User-Agent': 'EPro/1.0' // Nominatim requires User-Agent
                    }
                });
                if (nominatimRes.ok) {
                    const nominatimData = await nominatimRes.json();
                    if (nominatimData && nominatimData.length > 0) {
                        latitude = parseFloat(nominatimData[0].lat);
                        longitude = parseFloat(nominatimData[0].lon);
                    }
                }
            } catch (e) {
                console.error("Nominatim fallback failed", e);
            }
        }

        return {
            success: true,
            data: {
                street: data.street,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                latitude,
                longitude
            }
        };

    } catch (error) {
        console.error('Error fetching address:', error);
        return { success: false, error: 'Erro ao buscar endereço' };
    }
}

export async function fetchCoordinatesByAddress(address: string): Promise<{ latitude: number, longitude: number } | null> {
    if (!address || address.length < 5) return null;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
            headers: {
                'User-Agent': 'EPro/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
        }
    } catch (e) {
        console.error("Geocoding failed", e);
    }
    return null;
}
