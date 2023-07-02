import React from 'react'
import '../styles/CategoryItem.css'

const CategoryItem = ({ category, handler, description }) => {

    return (
        <div className='category' onClick={(e) => handler({ category, e })}>
            <span>{category.title}</span>
            <span>{description && category.description}</span>
        </div>
    )
}

export default CategoryItem;