import {
  Calendar,
  Users,
  FolderGit2,
  Layers,
  Code2,
  Brain,
  GraduationCap,
  Rocket,
} from 'lucide-react'

export const ICON_MAP = {
  Calendar,
  Users,
  FolderGit2,
  Layers,
  Code2,
  Brain,
  GraduationCap,
  Rocket,
}

export const getIcon = (name, props = {}) => {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon {...props} /> : null
}
