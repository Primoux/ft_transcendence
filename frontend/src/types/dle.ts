export interface Dle {
	id: string;
    name: string;
    players: number;
	status: "not started" | "in progress" | "completed";
	link: string;
}
