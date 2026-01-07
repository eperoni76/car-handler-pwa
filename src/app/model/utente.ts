export interface Utente {
    id: string;
    nome: string;
    cognome: string;
    email: string | null;
    codiceFiscale: string;
    dataDiNascita: Date | null;
    annoConseguimentoPatente: number | null;
}