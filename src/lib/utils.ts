import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapCompanyToSafe(company: any) {
    if (!company) return null;
    const { logoData, ...rest } = company;
    let logoBase64 = undefined;
    if (logoData && company.logoMimeType) {
        // Node compatibility for Buffer
        const buffer = Buffer.isBuffer(logoData) ? logoData : Buffer.from(logoData);
        logoBase64 = `data:${company.logoMimeType};base64,${buffer.toString('base64')}`;
    }
    return {
        ...rest,
        logoBase64
    };
}

/**
 * Serializes Prisma objects (handling Decimals and Dates) so they can be passed 
 * from Server Components/Actions to Client Components.
 */
export function serializePrisma<T>(data: T): T {
    if (!data) return data;
    return JSON.parse(JSON.stringify(data));
}
