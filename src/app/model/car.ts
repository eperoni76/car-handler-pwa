import { Revisione } from "./revisione";
import { Manutenzione } from "./manutenzione";
import { Utente } from "./utente";
import { Assicurazione } from "./assicurazione";

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
    coProprietari: Utente[];
    assicurazioni: Assicurazione[];
    manutenzioni: Manutenzione[];
    revisioni: Revisione[];
    dataProssimaManutenzione?: Date;
    dataProssimaRevisione?: Date;
}