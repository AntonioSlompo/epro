import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;
    console.log("i18n Request Config: locale from params:", locale);

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as any)) {
        console.log("i18n Request Config: Invalid/Missing locale, falling back to default");
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
