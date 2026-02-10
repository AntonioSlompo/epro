'use server';

interface AddressData {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
}

export interface CompanyData {
    name: string; // Razão Social
    tradeName: string; // Nome Fantasia
    address: AddressData;
}

export interface CompanyResponse {
    success: boolean;
    data?: CompanyData;
    error?: string;
    source?: string;
}

async function fetchBrasilAPI(cnpj: string): Promise<CompanyData | null> {
    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!res.ok) return null;
        const data = await res.json();
        return {
            name: data.razao_social,
            tradeName: data.nome_fantasia || data.razao_social,
            address: {
                street: data.logradouro,
                number: data.numero,
                complement: data.complemento,
                neighborhood: data.bairro,
                city: data.municipio,
                state: data.uf,
                zip: data.cep,
            }
        };
    } catch {
        return null;
    }
}

async function fetchReceitaWS(cnpj: string): Promise<CompanyData | null> {
    try {
        const res = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.status === "ERROR") return null;

        return {
            name: data.nome,
            tradeName: data.fantasia || data.nome,
            address: {
                street: data.logradouro,
                number: data.numero,
                complement: data.complemento,
                neighborhood: data.bairro,
                city: data.municipio,
                state: data.uf,
                zip: data.cep.replace(/\D/g, ''),
            }
        };
    } catch {
        return null;
    }
}

async function fetchCNPJWS(cnpj: string): Promise<CompanyData | null> {
    try {
        // Public tier limit is strict, handle with care or skip if preferred
        const res = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`);
        if (!res.ok) return null;
        const data = await res.json();

        return {
            name: data.razao_social,
            tradeName: data.estabelecimento.nome_fantasia || data.razao_social,
            address: {
                street: data.estabelecimento.logradouro,
                number: data.estabelecimento.numero,
                complement: data.estabelecimento.complemento,
                neighborhood: data.estabelecimento.bairro,
                city: data.estabelecimento.cidade.nome,
                state: data.estabelecimento.estado.sigla,
                zip: data.estabelecimento.cep,
            }
        };
    } catch {
        return null;
    }
}

export async function fetchCompanyByCnpj(cnpj: string): Promise<CompanyResponse> {
    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) {
        return { success: false, error: 'CNPJ inválido' };
    }

    // Attempt 1: BrasilAPI
    const brasilApiData = await fetchBrasilAPI(cleanCnpj);
    if (brasilApiData) {
        return { success: true, data: brasilApiData, source: 'BrasilAPI' };
    }

    // Attempt 2: ReceitaWS
    const receitaWsData = await fetchReceitaWS(cleanCnpj);
    if (receitaWsData) {
        return { success: true, data: receitaWsData, source: 'ReceitaWS' };
    }

    // Attempt 3: CNPJ.ws
    const cnpjWsData = await fetchCNPJWS(cleanCnpj);
    if (cnpjWsData) {
        return { success: true, data: cnpjWsData, source: 'CNPJ.ws' };
    }

    return { success: false, error: 'CNPJ não encontrado ou serviços indisponíveis.' };
}
