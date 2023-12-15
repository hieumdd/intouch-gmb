import { DocumentData } from '@google-cloud/firestore';

import { firestore } from '../../firestore.service';

const collection = () => firestore.collection('google-account');

export const getAll = async () => {
    return await collection()
        .get()
        .then((snapshot) => snapshot.docs.map((doc) => doc.data() as DocumentData));
};

export const setOne = async (id: string, data: any) => {
    return await collection().doc(id).set(data);
};
