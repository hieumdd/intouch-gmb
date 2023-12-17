import { CollectionReference } from '@google-cloud/firestore';

import { firestore } from '../../firestore.service';
import { Business } from './business.type';

const collection = () => firestore.collection('google-business') as CollectionReference<Business>;

export const getAll = async () => {
    return await collection()
        .get()
        .then((snapshot) => snapshot.docs);
};

export const getOne = async (id: string) => {
    return await collection().doc(id).get();
};

export const set = async (id: string, data: any) => {
    return await collection().doc(id).set(data, { merge: true });
};
