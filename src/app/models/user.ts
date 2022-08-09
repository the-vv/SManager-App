import { IUserSettings } from './common';

export interface IUser {
    email: string;
    name: string;
    id?: string;
    imageUrl?: string;
    settings?: IUserSettings;
};
