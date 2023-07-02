import React from 'react'
import { API } from '../services/APIService';
import '../styles/CategoriesContainer.css'
import CategoryItem from './CategoryItem';

const CategoriesContainer = ({ handler, categories, description }) => {
    return (
        <div className='categories_container'>
            {categories.map(category => {
                return <CategoryItem key={category.id} category={category} handler={handler} description={description} />
            })}
        </div>
    )
}

export default CategoriesContainer;