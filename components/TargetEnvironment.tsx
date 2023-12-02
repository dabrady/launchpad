'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';

import { createContext, useContext, useState } from "react";

import { Environment } from '@/app/types';
import { members } from '@/components/utils/typescript';

export const TargetEnvironmentContext = createContext({
  targetEnv: Environment.STAGING,
  setTargetEnv: function nope(env: Environment) {},
});

export function useTargetEnvironment() {
  return useContext(TargetEnvironmentContext);
}

export function TargetEnvironmentProvider({ children }) {
  var [targetEnv, setTargetEnv] = useState(Environment.STAGING);
  return (
    <TargetEnvironmentContext.Provider value={{
      targetEnv,
      setTargetEnv,
    }}>
      {children}
    </TargetEnvironmentContext.Provider>
  )
}

export function TargetEnvironment() {
  var { targetEnv, setTargetEnv: _setTargetEnv } = useTargetEnvironment();
  function setTargetEnv(env: Environment) {
    _setTargetEnv(env);
    closeMenu();
  }

  var [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  var open = Boolean(menuAnchor);
  function openMenu(ev: React.MouseEvent<HTMLElement>) {
    setMenuAnchor(ev.currentTarget);
  }
  function closeMenu() {
    setMenuAnchor(null);
  }

  return (
    <>
      <Button
        color='inherit'
        variant='outlined'
        onClick={openMenu}
        startIcon={<KeyboardArrowDownIcon />}
      >
        <Typography>{targetEnv}</Typography>
      </Button>
      <Menu
        open={open}
        anchorEl={menuAnchor}
        onClose={closeMenu}
      >
        {members(Environment).map(function render(env) {
          return (
            <MenuItem
              key={env}
              selected={targetEnv == Environment[env] }
              onClick={() => setTargetEnv(Environment[env])}
            >
              {env}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
