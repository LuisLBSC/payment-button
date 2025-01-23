import { PrismaClient } from "@prisma/client";
import e, { Request, Response } from "express";
import axios from 'axios';
import querystring from 'querystring';

const prisma = new PrismaClient();

export const createCheckout = async (req: Request, res: Response): Promise<Response> => {
    const path = '/v1/checkouts';
    const query = querystring.stringify({
      entityId: '8ac7a4c9946d09a101946f4ce97804f1',
      amount: '1.00',
      currency: 'USD',
      paymentType: 'DB'
    });
  
    const url = `${process.env.DATAFAST_URL}${process.env.DATAFAST_URL_PATH}?${query}`;
  
    try {
      const { data } = await axios.post(url, {}, {
        headers: {
          'Authorization': 'Bearer OGE4Mjk0MTg1YTY1YmY1ZTAxNWE2YzhjNzI4YzBkOTV8YmZxR3F3UTMyWA=='
        }
      });
  
      console.log({ data });
      return res.json({
            msg: 'ok',
            error: false,
            data
        });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ 
        msg: 'Error al crear el checkout',
        error  
    });
    }
  };