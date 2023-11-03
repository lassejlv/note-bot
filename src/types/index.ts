export interface Note {
  discord_id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cooldown {
  discord_id: string;
  time: number;
}

export interface Activities {
  name: "custom";
  state: string;
  type: unknown;
}
