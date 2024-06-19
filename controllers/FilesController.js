import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(request, response) {
    const token = request.headers['x-token'];
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    const collection = dbClient.client.db().collection('users');
    const existingUser = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const dataBody = request.body;
    const name = dataBody.name || null;
    if (!name) {
      response.status(400).json({ error: 'Missing name' });
      return;
    }
    const type = dataBody.type || null;
    const arr = ['folder', 'file', 'image'];
    if (!arr.includes(type)) {
      response.status(400).json({ error: 'Missing type' });
      return;
    }
    const parentId = dataBody.parentId || 0;
    const isPublic = dataBody.isPublic || false;
    const data = dataBody.data ? atob(dataBody.data) : null;
    if (!data && type !== 'folder') {
      response.status(400).json({ error: 'Missing data' });
      return;
    }
    const collection2 = dbClient.client.db().collection('files');
    if (parentId !== 0) {
      const existingFile = await collection2.findOne({ _id: new ObjectId(parentId) });
      if (!existingFile) {
        response.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (existingFile.type !== 'folder') {
        response.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    const userId = id;
    if (type === 'folder') {
      const obj = {
        type,
        isPublic,
        parentId: parentId === 0 ? parentId : new ObjectId(parentId),
        name,
        userId: new ObjectId(userId),
      };
      const folder = await collection2.insertOne(obj);
      const folderId = folder.insertedId.toString();
      const returnObj = {
        type,
        id: folderId,
        userId,
        isPublic,
        parentId,
        name,
      };
      response.status(201).json(returnObj);
      return;
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileName = uuidv4();
    const folders = folderPath.split(path.sep);

    let currentDirectory = '/';
    for (const folder of folders) {
      currentDirectory = path.join(currentDirectory, folder);
      if (!fs.existsSync(currentDirectory)) {
        fs.mkdirSync(currentDirectory);
      }
    }

    const filePath = path.join(currentDirectory, fileName);
    fs.writeFileSync(filePath, data);
    const obj = {
      type,
      isPublic,
      parentId: parentId === 0 ? parentId : new ObjectId(parentId),
      name,
      localPath: path.resolve(filePath),
      userId: new ObjectId(userId),
    };
    const folder = await collection2.insertOne(obj);
    const folderId = folder.insertedId.toString();
    const returnObj = {
      type,
      id: folderId,
      userId,
      isPublic,
      parentId,
      name,
    };
    response.status(201).json(returnObj);
  }
}
