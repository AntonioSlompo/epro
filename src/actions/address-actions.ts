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

    // Attempt with BrasilAPI V2 (includes coordinates)
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        if (response.ok) {
            const data: AddressData = await response.json();
            return await processAddressData(data);
        }

        if (response.status === 404) {
            return { success: false, error: 'CEP não encontrado' };
        }
    } catch (error) {
        console.error('BrasilAPI V2 failed:', error);
    }

    // Fallback to BrasilAPI V1
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`, {
            cache: 'no-store'
        });

        if (response.ok) {
            const data: AddressData = await response.json();
            return await processAddressData(data);
        }
    } catch (error) {
        console.error('BrasilAPI V1 failed:', error);
    }

    // Last resort: ViaCEP (very stable, but no coordinates)
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
            cache: 'no-store'
        });

        if (response.ok) {
            const data = await response.json();
            if (!data.erro) {
                const processed = {
                    success: true,
                    data: {
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }
                };
                // Try to get coordinates via Nominatim
                return await enrichWithCoordinates(processed);
            }
        }
    } catch (error) {
        console.error('ViaCEP failed:', error);
    }

    return { success: false, error: 'Não foi possível encontrar o endereço para este CEP' };
}

async function processAddressData(data: AddressData): Promise<AddressResponse> {
    let latitude: number | undefined;
    let longitude: number | undefined;

    const coords = data.location?.coordinates;
    if (coords && coords.latitude && coords.longitude) {
        latitude = parseFloat(coords.latitude);
        longitude = parseFloat(coords.longitude);
    }

    const response: AddressResponse = {
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

    if (!latitude || !longitude) {
        return await enrichWithCoordinates(response);
    }

    return response;
}

async function enrichWithCoordinates(response: AddressResponse): Promise<AddressResponse> {
    if (!response.data || !response.data.street || !response.data.city) return response;

    try {
        const addressQuery = `${response.data.street}, ${response.data.city}, ${response.data.state}, Brazil`;
        const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressQuery)}&limit=1`, {
            headers: { 'User-Agent': 'EPro/1.0' }
        });
        
        if (nominatimRes.ok) {
            const nominatimData = await nominatimRes.json();
            if (nominatimData && nominatimData.length > 0) {
                response.data.latitude = parseFloat(nominatimData[0].lat);
                response.data.longitude = parseFloat(nominatimData[0].lon);
            }
        }
    } catch (e) {
        console.error("Nominatim enrichment failed", e);
    }
    return response;
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
