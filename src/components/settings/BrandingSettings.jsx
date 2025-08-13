import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Upload, Camera, Link2, Loader2, Trash2 as TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { supabase } from '@/lib/supabaseClient';
import { sanitizeFilename } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const renderInput = (label, id, value, onChange, placeholder = '', type = 'text', icon) => {
  const Icon = icon;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />}
        <Input id={id} type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={Icon ? "pl-10" : ""} />
      </div>
    </div>
  );
};

const BrandingSettings = ({ formData, handleInputChange, toast }) => {
  const { user, setSettings, settings } = useData();
  const profilePhotoInputRef = useRef(null);
  const logoInputRef = useRef(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [imageToDelete, setImageToDelete] = useState({ type: null, url: null });
  const [isDeleteImageDialogOpen, setIsDeleteImageDialogOpen] = useState(false);


  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  const handleFileUpload = async (event, type) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "Arquivo Muito Grande",
        description: `O arquivo deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`,
        variant: "destructive",
      });
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Tipo de Arquivo Inválido",
        description: "Por favor, selecione um arquivo PNG, JPG, GIF ou WEBP.",
        variant: "destructive",
      });
      return;
    }

    if (type === 'profile') setIsUploadingProfile(true);
    if (type === 'logo') setIsUploadingLogo(true);

    const originalFilename = file.name;
    const sanitizedOriginalFilename = sanitizeFilename(originalFilename);
    const fileExtension = sanitizedOriginalFilename.split('.').pop();
    const baseFilename = type === 'profile' ? 'profile_photo' : 'logo';
    
    const finalSanitizedName = `${baseFilename}_${Date.now()}${fileExtension ? '.' + fileExtension : ''}`;
    const filePath = `public/${user.id}/${finalSanitizedName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('user_assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, 
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('user_assets')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Não foi possível obter a URL pública do arquivo.");
      }
      
      const newSettings = { ...settings, ...formData };
      if (type === 'profile') {
        newSettings.profile_photo = publicUrlData.publicUrl;
      } else if (type === 'logo') {
        newSettings.logo = publicUrlData.publicUrl;
      }
      
      await setSettings(newSettings); 
      handleInputChange(type === 'profile' ? 'profile_photo' : 'logo', publicUrlData.publicUrl);


      toast({
        title: `${type === 'profile' ? 'Foto de Perfil' : 'Logotipo'} Atualizado(a)!`,
        description: `Sua imagem foi enviada com sucesso.`,
      });

    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: `Erro ao Enviar ${type === 'profile' ? 'Foto de Perfil' : 'Logotipo'}`,
        description: error.message || "Ocorreu um problema ao enviar sua imagem.",
        variant: "destructive",
      });
    } finally {
      if (type === 'profile') setIsUploadingProfile(false);
      if (type === 'logo') setIsUploadingLogo(false);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = "";
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };
  
  const openDeleteImageDialog = (type, url) => {
    if (!url) return;
    setImageToDelete({ type, url });
    setIsDeleteImageDialogOpen(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete.type || !imageToDelete.url || !user) return;
    
    const filenameFromUrl = imageToDelete.url.substring(imageToDelete.url.lastIndexOf('/') + 1);
    const filePath = `public/${user.id}/${filenameFromUrl}`;


    try {
      const { error: deleteError } = await supabase.storage
        .from('user_assets')
        .remove([filePath]);
      
      if (deleteError && deleteError.message !== 'The resource was not found' && !deleteError.message.includes('No objects found')) {
         throw deleteError;
      }

      const fieldToUpdate = imageToDelete.type === 'profile' ? 'profile_photo' : 'logo';
      const updatedSettings = { ...settings, ...formData, [fieldToUpdate]: null };
      await setSettings(updatedSettings);
      handleInputChange(fieldToUpdate, null);

      toast({
        title: "Imagem Removida",
        description: `Sua ${imageToDelete.type === 'profile' ? 'foto de perfil' : 'logotipo'} foi removida.`,
      });
    } catch (error) {
      console.error(`Error deleting ${imageToDelete.type}:`, error);
      toast({
        title: `Erro ao Remover Imagem`,
        description: error.message || "Ocorreu um problema ao remover a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteImageDialogOpen(false);
      setImageToDelete({ type: null, url: null });
    }
  };


  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }} 
      className="bg-card rounded-xl p-6 shadow-lg border border-border lg:col-span-1"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-customPurple to-customGreen rounded-lg flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">Marca (Branding)</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Foto de Perfil</label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-customPurple to-customGreen rounded-full flex items-center justify-center text-white font-semibold text-xl overflow-hidden">
              {formData.profile_photo ? (
                <img src={formData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.user_name ? formData.user_name.charAt(0).toUpperCase() : 'G'
              )}
            </div>
            <input 
              type="file" 
              ref={profilePhotoInputRef} 
              onChange={(e) => handleFileUpload(e, 'profile')}
              accept={ALLOWED_FILE_TYPES.join(',')}
              style={{ display: 'none' }} 
              id="profilePhotoUpload"
            />
            <Button onClick={() => profilePhotoInputRef.current?.click()} variant="outline" disabled={isUploadingProfile}>
              {isUploadingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {isUploadingProfile ? 'Enviando...' : 'Alterar Foto'}
            </Button>
            {formData.profile_photo && (
              <Button variant="ghost" size="icon" onClick={() => openDeleteImageDialog('profile', formData.profile_photo)} className="text-red-500 hover:text-red-600">
                <TrashIcon size={16} />
              </Button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Logotipo da Empresa</label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-14 h-14 object-contain" />
              ) : (
                <Camera className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <input 
              type="file" 
              ref={logoInputRef} 
              onChange={(e) => handleFileUpload(e, 'logo')}
              accept={ALLOWED_FILE_TYPES.join(',')}
              style={{ display: 'none' }}
              id="logoUpload"
            />
            <Button onClick={() => logoInputRef.current?.click()} variant="outline" disabled={isUploadingLogo}>
              {isUploadingLogo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              {isUploadingLogo ? 'Enviando...' : (formData.logo ? 'Alterar Logo' : 'Adicionar Logo')}
            </Button>
             {formData.logo && (
              <Button variant="ghost" size="icon" onClick={() => openDeleteImageDialog('logo', formData.logo)} className="text-red-500 hover:text-red-600">
                <TrashIcon size={16} />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Seu logotipo será usado para seus relatórios, comprovantes de pagamentos, contratos e outras funcionalidades...</p>
        </div>
        {renderInput('Subdomínio Personalizado', 'subdomain', formData.subdomain, (val) => handleInputChange('subdomain', val), 'meusite', 'text', Link2)}
         <p className="text-xs text-muted-foreground mt-1">
            Crie um subdomínio como <code className="bg-muted px-1 rounded">meusite.gofotografo.com</code>
          </p>
      </div>
    </motion.div>

    <AlertDialog open={isDeleteImageDialogOpen} onOpenChange={setIsDeleteImageDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover esta imagem? A imagem será excluída do armazenamento.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setImageToDelete({ type: null, url: null })}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDeleteImage} className="bg-red-600 hover:bg-red-700">Remover Imagem</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default BrandingSettings;