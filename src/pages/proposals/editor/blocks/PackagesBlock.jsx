import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


const PackageGrid = ({ packages, styles }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {packages.map(pkg => (
            <Card key={pkg.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                    <CardTitle style={{color: styles.headingColor}}>{pkg.name}</CardTitle>
                    <CardDescription style={{color: styles.textColor}}>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-3xl font-bold mb-4" style={{color: styles.accentColor}}>R$ {pkg.price_cash_pix}</p>
                    <ul className="space-y-2">
                        {(pkg.items_included || []).map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span style={{color: styles.textColor}}>{typeof item === 'object' ? item.name : item}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" style={{backgroundColor: styles.accentColor}}>Selecionar Pacote</Button>
                </CardFooter>
            </Card>
        ))}
    </div>
);

const PackageTable = ({ packages, styles }) => (
    <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
                <tr>
                    <th className="py-3 px-6 text-left text-xs font-medium uppercase tracking-wider" style={{color: styles.headingColor}}>Recurso</th>
                    {packages.map(pkg => (
                        <th key={pkg.id} className="py-3 px-6 text-center text-xs font-medium uppercase tracking-wider" style={{color: styles.headingColor}}>{pkg.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {/* Collect all unique items */}
                {[...new Set(packages.flatMap(p => (p.items_included || []).map(item => typeof item === 'object' ? item.name : item)))].map((item, itemIndex) => (
                    <tr key={itemIndex}>
                        <td className="py-4 px-6 text-sm font-medium" style={{color: styles.textColor}}>{item}</td>
                        {packages.map(pkg => (
                            <td key={pkg.id} className="py-4 px-6 text-center text-sm">
                                {(pkg.items_included || []).some(pkgItem => (typeof pkgItem === 'object' ? pkgItem.name : pkgItem) === item) ? 
                                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" /> : 
                                    <span className="text-gray-400">-</span>
                                }
                            </td>
                        ))}
                    </tr>
                ))}
                <tr>
                    <td className="py-4 px-6 text-sm font-medium" style={{color: styles.headingColor}}>Preço</td>
                     {packages.map(pkg => (
                        <td key={pkg.id} className="py-4 px-6 text-center text-lg font-bold" style={{color: styles.accentColor}}>R$ {pkg.price_cash_pix}</td>
                    ))}
                </tr>
                <tr>
                    <td></td>
                    {packages.map(pkg => (
                         <td key={pkg.id} className="py-4 px-6 text-center">
                             <Button style={{backgroundColor: styles.accentColor}}>Selecionar</Button>
                         </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
);

const PackageAccordion = ({ packages, styles }) => (
    <Accordion type="single" collapsible className="w-full">
        {packages.map(pkg => (
            <AccordionItem value={`item-${pkg.id}`} key={pkg.id}>
                <AccordionTrigger style={{color: styles.headingColor}}>{pkg.name}</AccordionTrigger>
                <AccordionContent>
                    <div className="p-4">
                        <p className="text-lg font-bold mb-4" style={{color: styles.accentColor}}>R$ {pkg.price_cash_pix}</p>
                        <p className="mb-4" style={{color: styles.textColor}}>{pkg.description}</p>
                        <ul className="space-y-2 mb-4">
                            {(pkg.items_included || []).map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span style={{color: styles.textColor}}>{typeof item === 'object' ? item.name : item}</span>
                                </li>
                            ))}
                        </ul>
                         <Button className="w-full" style={{backgroundColor: styles.accentColor}}>Selecionar Pacote</Button>
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
);


const PackagesBlock = ({ content, styles }) => {
    const { servicePackages } = useData();
    const { packageIds = [], layout = 'grid', title } = content;

    const selectedPackages = (servicePackages || []).filter(pkg => packageIds.includes(pkg.id));

    if (!selectedPackages || selectedPackages.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">Selecione os pacotes a serem exibidos no painel de edição.</div>;
    }

    const renderLayout = () => {
        switch (layout) {
            case 'table': return <PackageTable packages={selectedPackages} styles={styles} />;
            case 'accordion': return <PackageAccordion packages={selectedPackages} styles={styles} />;
            case 'grid':
            default: return <PackageGrid packages={selectedPackages} styles={styles} />;
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {title && <h2 className="text-3xl font-bold mb-8 text-center" style={{color: styles.headingColor}}>{title}</h2>}
            {renderLayout()}
        </div>
    );
};

export default PackagesBlock;