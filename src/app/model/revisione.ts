export interface Revisione {
    id: string;
    data: Date;
    chilometraggio: number;
    esito: 'positiva' | 'negativa';
    note?: string;
}