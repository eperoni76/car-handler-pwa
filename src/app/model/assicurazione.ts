export interface Assicurazione {
    id: string;
    compagnia: string;
    numeroPolizza: string;
    dataInizio: Date;
    dataFine: Date;
    costoAnnuale: number;
    coperture: string[];
    documento?: {
        nome: string;
        url: string;
        dimensione: number;
        dataCaricamento: Date;
    };
}