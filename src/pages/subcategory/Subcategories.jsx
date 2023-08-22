import React from 'react';
import { renderToString } from 'react-dom/server';
import { TiDelete } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';

// Components
import { useAppStates } from '../../helpers/states';
import { useApi } from '../../helpers/api';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
// Sources
import Swal from 'sweetalert2';
import imgSubcategories from '../../assets/images/headerOptions/Subcategories.svg';

function Subcategories() {    
    const { setIsLoading, addToastr, setMenuConfig } = useAppStates();
    const { getApiData, postApiData } = useApi();
    const navigate = useNavigate();
    const [subcategories, setSubcategories] = React.useState([]);    
    const MemoizedTiDelete = React.memo(TiDelete);

    const getSubcategories = React.useCallback(async () => {
        if (subcategories.length !== 0) {
            return;
        }
        try {
            const data = await getApiData('Subcategory/GetSubcategoriesByCategories', true);
            if (!data.subcategories.length) {
                addToastr('Registra tu primera subcategoría', 'info');
            }                            
            setSubcategories(data.subcategories);
        } catch (error) {
            addToastr(error.message, error.type || 'error');
        }
    }, [subcategories, addToastr, getApiData])

    React.useEffect(() => {
        setMenuConfig(() => ({
            path: '/home/settings',
            option: 'settings'
        }));
        getSubcategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps        
    }, []);
    
    const handleAddSubcategory = React.useCallback(() => {   
        setIsLoading(true);
        navigate('new');
    }, [setIsLoading, navigate]);

    const handleEditSubcategory = React.useCallback((id) => {
        setIsLoading(true);
        navigate(`edit/${id}`);
    }, [setIsLoading, navigate]);
    
    const handleDeleteSubcategory = React.useCallback(async (id) => {
        const { isConfirmed } = await Swal.fire({
            html: `${renderToString(<MemoizedTiDelete size={130} color='var(--principal)' />)}
                   <div style='font-size: 1.5rem; font-weight: 700;'>¿Estas seguro de <b style='color:#E94040;'>Eliminar</b> la subcategoría?</div>`,
            showCancelButton: true,
            confirmButtonColor: '#E94040',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal2-background-custom'
            }
        })

        if (isConfirmed) {
            try {
                const body = { 
                    'subcategory_Id': id 
                }
                const data = await postApiData('Subcategory/DeleteSubcategory', body, true, 'application/json');
                const updatedList = subcategories.map( category => {
                    const subcategories = JSON.parse(category.SubCategories);
                    const filtered = subcategories.filter(subcategory => subcategory.Id !== id);
                    category.SubCategories = JSON.stringify(filtered);
                    return category;
                });
                setSubcategories(updatedList);
                addToastr(data.rpta);
            } catch (error) {
                addToastr(error.message, error.type || 'error');
            }
        }
    }, [postApiData, addToastr, subcategories]);
    
    const memoizedHandleEditSubcategory = React.useMemo(
        () => (id) => handleEditSubcategory(id),
        [handleEditSubcategory]
    );

    const memoizedHandleDeleteSubcategory = React.useMemo(
        () => (id) => handleDeleteSubcategory(id),
        [handleDeleteSubcategory]
    );

    const subcategoryComponents = React.useMemo(() => (
        subcategories.map( category => (
            JSON.parse(category.SubCategories).length > 0 &&
            <div className='card_container' key={category.Id}>
                <h3 className='category_name'>{category.Name}</h3>
                {JSON.parse(category.SubCategories).map( subcategory => (
                    <Card 
                        key={subcategory.Id} 
                        onEdit={() => memoizedHandleEditSubcategory(subcategory.Id)} 
                        onDelete={() => memoizedHandleDeleteSubcategory(subcategory.Id)} 
                        name={subcategory.Name} 
                    />
                ))}
            </div>
        ))
    ), [subcategories, memoizedHandleEditSubcategory, memoizedHandleDeleteSubcategory]);

    return (
        <div className='page_container'>
            <Header logo={imgSubcategories} title='Subcategorías' />
            <Button name='Agregar Subcategoría' onClick={handleAddSubcategory} icon='add' dark />

            {subcategoryComponents}
        </div>
    );
}

export { Subcategories };