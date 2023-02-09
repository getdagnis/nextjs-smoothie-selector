// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

interface Flavor {
  name: string;
  quantity: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Flavor[]>) {
  res.status(200).json([
    { name: 'Smelly Sock', quantity: 0 },
    { name: 'Old Sneakers', quantity: 0 },
    { name: 'Rotten Veggies', quantity: 0 },
    { name: 'Sad Salad', quantity: 0 },
  ]);
}
