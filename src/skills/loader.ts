import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { BaseSkill, SkillMeta } from './base.js';

/**
 * Dynamically loads skills from the skills directory.
 */
export class SkillLoader {
  private skillsDir: string;
  private loadedSkills: Map<string, BaseSkill> = new Map();

  constructor(skillsDir: string) {
    this.skillsDir = skillsDir;
  }

  /**
   * List all available skills in the skills directory.
   */
  async listSkills(): Promise<SkillMeta[]> {
    const skills: SkillMeta[] = [];

    if (!existsSync(this.skillsDir)) {
      return skills;
    }

    const entries = await readdir(this.skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillPath = join(this.skillsDir, entry.name);
      const indexPath = join(skillPath, 'index.ts');
      const indexJsPath = join(skillPath, 'index.js');

      if (existsSync(indexPath) || existsSync(indexJsPath)) {
        skills.push({
          name: entry.name,
          description: '',
          version: '0.2.0',
          path: skillPath,
        });
      }
    }

    return skills;
  }

  /**
   * Load specific skills by name.
   * Returns successfully loaded skills.
   */
  async loadSkills(skillNames: string[]): Promise<BaseSkill[]> {
    const loaded: BaseSkill[] = [];

    for (const name of skillNames) {
      try {
        const skill = await this.loadSkill(name);
        if (skill) {
          this.loadedSkills.set(name, skill);
          loaded.push(skill);
        }
      } catch (error) {
        console.error(`[skills] Failed to load skill "${name}":`, error);
      }
    }

    return loaded;
  }

  /**
   * Load a single skill by name.
   */
  private async loadSkill(name: string): Promise<BaseSkill | null> {
    const skillPath = join(this.skillsDir, name);

    if (!existsSync(skillPath)) {
      console.warn(`[skills] Skill directory not found: ${skillPath}`);
      return null;
    }

    // Try to import the skill module
    // In production, skills would be compiled JS; in dev, we use tsx
    const indexJs = join(skillPath, 'index.js');
    const indexTs = join(skillPath, 'index.ts');

    let modulePath: string;
    if (existsSync(indexJs)) {
      modulePath = indexJs;
    } else if (existsSync(indexTs)) {
      modulePath = indexTs;
    } else {
      console.warn(`[skills] No index.ts or index.js found in: ${skillPath}`);
      return null;
    }

    try {
      const mod = await import(modulePath);
      const SkillClass = mod.default || mod[Object.keys(mod)[0]];

      if (typeof SkillClass === 'function') {
        return new SkillClass();
      } else if (typeof SkillClass === 'object' && SkillClass.analyze) {
        return SkillClass as BaseSkill;
      }

      console.warn(`[skills] Skill "${name}" does not export a valid skill class or object`);
      return null;
    } catch (error) {
      console.error(`[skills] Error importing skill "${name}":`, error);
      return null;
    }
  }

  /**
   * Get all currently loaded skills.
   */
  getLoadedSkills(): BaseSkill[] {
    return Array.from(this.loadedSkills.values());
  }

  /**
   * Get a loaded skill by name.
   */
  getSkill(name: string): BaseSkill | undefined {
    return this.loadedSkills.get(name);
  }
}
