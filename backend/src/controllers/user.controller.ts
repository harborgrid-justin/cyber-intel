
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export const listUsers = async (req: Request, res: Response) => {
  const users = await UserService.getAll();
  res.json({ data: users });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await UserService.getById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: user });
};

export const createUser = async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body, req.user!.username);
  res.status(201).json({ data: user });
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await UserService.updateUser(req.params.id, req.body, req.user!.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: user });
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const user = await UserService.updateUserStatus(req.params.id, req.body.status, req.user!.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ data: user });
};

export const deleteUser = async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(req.params.id);
  if (!result) return res.status(404).json({ error: 'User not found' });
  res.status(204).send();
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  
  // Convert Set to Array for JSON response
  const permissions = Array.from(req.permissions || []);
  
  res.json({
    data: {
      ...req.user.toJSON(),
      permissions
    }
  });
};
