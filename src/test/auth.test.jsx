import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '@/contexts/authContext';

// Mock do Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: global.mockSupabase
}));

// Componente de teste para testar o contexto
const TestComponent = () => {
  const { logout } = React.useContext(AuthContext);
  
  return (
    <button onClick={logout} data-testid="logout-button">
      Logout
    </button>
  );
};

describe('Auth Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('deve limpar localStorage e sessionStorage no logout', async () => {
    const user = userEvent.setup();
    
    // Simula dados no storage
    localStorage.setItem('test-key', 'test-value');
    sessionStorage.setItem('session-key', 'session-value');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const logoutButton = screen.getByTestId('logout-button');
    await user.click(logoutButton);
    
    // Verifica se o Supabase signOut foi chamado
    expect(global.mockSupabase.auth.signOut).toHaveBeenCalled();
    
    // Verifica se os storages foram limpos
    expect(localStorage.getItem('test-key')).toBeNull();
    expect(sessionStorage.getItem('session-key')).toBeNull();
  });

  it('deve lidar com erros de storage graciosamente', async () => {
    const user = userEvent.setup();
    
    // Simula erro no localStorage
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    Storage.prototype.clear = vi.fn(() => {
      throw new Error('Storage error');
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    const logoutButton = screen.getByTestId('logout-button');
    
    // Não deve lançar erro mesmo com falha no storage
    await expect(user.click(logoutButton)).resolves.not.toThrow();
    
    consoleWarnSpy.mockRestore();
  });
});