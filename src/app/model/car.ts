import { Revisione } from "./revisione";
import { Tagliando } from "./tagliando";
import { Utente } from "./utente";

export interface Car {
    targa: string;
    marca: string;
    modello: string;
    anno: number;
    colore: string;
    prezzoDiAcquisto: number;
    prezzoDiVendita?: number;
    dataDiAcquisto: Date;
    dataDiVendita?: Date;
    proprietario: Utente;
    tagliandi: Tagliando[];
    revisioni: Revisione[];
    dataProssimoTagliando?: Date;
    dataProssimaRevisione?: Date;
}