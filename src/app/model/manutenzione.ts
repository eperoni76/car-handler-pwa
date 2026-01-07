export interface Manutenzione {
    id: string;
    data: Date;
    chilometraggio: number;
    descrizione: string;
    costo: number;
    tipologia: 'ordinaria' | 'straordinaria';
}
