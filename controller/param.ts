import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
export const getAllParams = async(req: Request, res: Response) => {
    try {
        const params = await prisma.param.findMany({where: {active : 1}});
        res.json({
            msg: 'ok',
            error: false,
            records: params.length,
            data: params
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo parámetros',
            error
        });
    }
}

export const getRequestParams = async(req: Request, res: Response) => {
    try {
        const params = await prisma.param.findMany({
            where: {
                active : 1,
                key: {
                    startsWith: 'request_',
                }
            }});
        res.json({
            msg: 'ok',
            error: false,
            records: params.length,
            data: params
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo parámetros',
            error
        });
    }
}

export const getParamById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if(!id|| isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingParam = await prisma.param.findFirst({where: {id: idNumber}});

        if(!existingParam)
            res.status(404).json({msg: 'Parámetro no encontrado', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingParam
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo parámetro',
            error: error,
            data: []

        });
    }
}

export const getParamByKey = async(req: Request, res: Response) => {
    try {
        const {key} = req.params;
        if(!key) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingParam = await prisma.param.findFirst({where: {key}});

        if(!existingParam)
            res.status(404).json({msg: 'Parámetro no encontrado', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingParam
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo parámetro',
            error: error,
            data: []

        });
    }
}

export const saveParam = async(req: Request, res: Response) => {
    try {
        const {key, value} = req.body;
        const newParam = await prisma.param.upsert({
            create: {key, value},
            update: {key, value},
            where : {key}
        })
        res.json({
            newParam,
            msg: `Parámetro ${newParam.key} creado`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
}

export const updateParamById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        const {key, value} = req.body;

        if(!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingParam = await prisma.param.findFirst({where: {id: idNumber}});

        if(!existingParam)
            res.status(404).json({msg: 'Parámetro no encontrado', error: false, data:[]});

        await prisma.param.update({
            where: {
                id: idNumber
            },
            data: {
                key,
                value
            }
            });
        res.status(200).json({
            msg: `Parámetro ${key} actualizado`,
            error: false,
            records: 1
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const updateParamByKey = async(req: Request, res: Response) => {
    try {
        const {key} = req.params;
        const {value} = req.body;

        if(!key) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingParam = await prisma.param.findFirst({where: {key}});

        if(!existingParam)
            res.status(404).json({msg: 'Parámetro no encontrado', error: false, data:[]});

        await prisma.param.update({
            where: {
                key
            },
            data: {
                value
            }
            });
        res.status(200).json({
            msg: `Parámetro ${key} actualizado`,
            error: false,
            records: 1
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const deleteParamById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if(!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.param.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });

        res.status(200).json({
            msg: `Parámetro ${id} eliminado`,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const deleteParamByKey = async(req: Request, res: Response) => {
    try {
        const {key} = req.params;
        if(!key) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.param.update({
            where: {
                key
            },
            data: {
                active: 0
            }
        });

        res.status(200).json({
            msg: `Parámetro ${key} elñiminado`,
            error: false
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Somenthing went wrong',
            error
        });
    }
}

export const saveOrUpdateParams = async (req: Request, res: Response) => {
    try {
        const params = req.body;  
        if (!Array.isArray(params)) {
            return res.status(400).json({
                msg: 'Solicitud debe ser un arreglo de parámetros',
                error: true
            });
        }

        const updatedParams = await Promise.all(
            params.map(async (param) => {
                const { key, value, active } = param;
                return await prisma.param.upsert({
                    where: { key },
                    update: {
                        value,
                        active: active ?? 1,
                    },
                    create: {
                        key,
                        value,
                        active: active ?? 1, 
                    },
                });
            })
        );

        res.json({
            msg: 'Parámetros procesados ​​exitosamente',
            error: false,
            records: updatedParams.length,
            data: updatedParams
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
}
