// Map category codes to Arabic display text
export const categoryMap: Record<string, string> = {
    'ARCHAEOLOGICAL': 'تاريخي/أثري',
    'RELIGIOUS': 'ديني',
    'ENTERTAINMENT': 'ترفيهي',
    'EDUCATIONAL': 'تعليمي',
    'RESTAURANT': 'مطاعم',
    'HISTORICAL': 'تاريخي/أثري', // Handle legacy value
};

// Function to translate category code to Arabic text
export const translateCategory = (category: string): string => {
    return categoryMap[category] || category;
};

// List of all categories as options for dropdown
export const categoryOptions = Object.entries(categoryMap)
    .filter(([key]) => key !== 'HISTORICAL') // Remove duplicates
    .map(([value, label]) => ({
        value,
        label
    })); 