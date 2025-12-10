import { Request, Response } from 'express';
import { Asset } from '../models/infrastructure';
import { Actor } from '../models/intelligence';
import { GraphEngine } from '../services/analysis/graph.engine';
import { SimulationService } from '../services/simulation.service';
import { SimulationEngine } from '../services/analysis/simulation.engine';

export const runSimulation = async (req: Request, res: Response) => {
  try {
    const { actorId, targetNodeId, entryNodeId } = req.body;
    
    const assets = await (Asset as any).findAll();
    const actor = await (Actor as any).findByPk(actorId);
    
    if (!actor || !assets.length) {
      return res.status(400).json({ error: 'Invalid Actor or Assets configuration' });
    }

    const entry = entryNodeId || assets.find((a: any) => a.type === 'Workstation')?.id || assets[0].id;
    const paths = await GraphEngine.findBreachPaths(entry, targetNodeId, assets, actor);
    
    const result = {
      id: `SIM-${Date.now()}`,
      actor: actor.name,
      target: targetNodeId,
      paths: paths,
      successProbability: paths[0]?.prob || 0
    };

    await SimulationService.saveResult(result, req.user!.username);
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ error: 'Simulation Failed' });
  }
};

export const calculateEvasion = async (req: Request, res: Response) => {
  const { actorId, nodeId } = req.body;
  const actor = await (Actor as any).findByPk(actorId);
  const node = await (Asset as any).findByPk(nodeId);
  
  if (!actor || !node) return res.status(404).json({ error: 'Resource not found' });
  
  // Map security controls for demo (would be in DB normally)
  // Re-hydrate full model instance or use raw values if needed
  
  const result = SimulationEngine.calculateEvasion(actor, node);
  res.json({ data: result });
};

export const calculateExfil = async (req: Request, res: Response) => {
  const { nodeId, config } = req.body;
  const node = await (Asset as any).findByPk(nodeId);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  
  const result = SimulationEngine.calculateExfilPhysics(node, config);
  res.json({ data: result });
};