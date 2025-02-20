import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
export const getAllEntities = async(req: Request, res: Response) => {
    try {
        const entities = await prisma.entity.findMany({where: {active : 1}});
        res.json({
            msg: 'ok',
            error: false,
            records: entities.length,
            data: entities
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo entidades',
            error
        });
    }
}

export const getEntityById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if(!id|| isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingEntity = await prisma.entity.findFirst({where: {id: idNumber}});

        if(!existingEntity)
            res.status(404).json({msg: 'Entidad no encontrada', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingEntity
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo entidades',
            error: error,
            data: []

        });
    }
}

export const getEntityByName = async(req: Request, res: Response) => {
    try {
        const {name} = req.params;
        if(!name) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingEntity = await prisma.entity.findFirst({where: {name}});

        if(!existingEntity)
            res.status(404).json({msg: 'Entidad no encontrada', error: false, data:[]});
    
        res.json({
            msg: 'ok',
            error: false,
            records: 1,
            data: existingEntity
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error obteniendo entidades',
            error: error,
            data: []

        });
    }
}

export const saveEntity = async(req: Request, res: Response) => {
    try {
        const {name, description} = req.body;
        const newEntity = await prisma.entity.upsert({
            create: {name, description},
            update: {name, description},
            where : {name}
        })
        res.json({
            newEntity,
            msg: `Entidad ${newEntity.name} creada`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Something went wrong',
            error
        });
    }
}

export const updateEntityById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        const {name, description} = req.body;

        if(!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingEntity = await prisma.entity.findFirst({where: {id: idNumber}});

        if(!existingEntity)
            res.status(404).json({msg: 'Entidad no encontrada', error: false, data:[]});

        await prisma.entity.update({
            where: {
                id: idNumber
            },
            data: {
                name,
                description
            }
            });
        res.status(200).json({
            msg: `Entidad ${name} actualizada`,
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

export const updateEntityByName = async(req: Request, res: Response) => {
    try {
        const {name} = req.params;
        const {description} = req.body;

        if(!name) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        const existingEntity = await prisma.entity.findFirst({where: {name}});

        if(!existingEntity)
            res.status(404).json({msg: 'Entidad no encontrada', error: false, data:[]});

        await prisma.entity.update({
            where: {
                name
            },
            data: {
                description
            }
            });
        res.status(200).json({
            msg: `Entidad ${name} actualizada`,
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

export const deleteEntityById = async(req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const idNumber = parseInt(id, 10);
        if(!id || isNaN(idNumber)) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.entity.update({
            where: {
                id: idNumber
            },
            data: {
                active: 0
            }
        });

        res.status(200).json({
            msg: `Entidad ${id} eliminada`,
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

export const deleteEntityByName = async(req: Request, res: Response) => {
    try {
        const {name} = req.params;
        if(!name) res.status(400).json({ msg: 'Bad request', error: true, records: 0, data: [] });

        await prisma.entity.update({
            where: {
                name
            },
            data: {
                active: 0
            }
        });

        res.status(200).json({
            msg: `Entidad ${name} eliminada`,
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
